import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,ImageBackground
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postOutstanding } from "../../../../redux/action";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const Outstanding = () => {
  const dispatch = useDispatch();
      const navigation = useNavigation();

  const outstandingInvoicesData = useSelector(
    (state) => state.postOutstandingReducer.data["outstandingInvoices"] || []
  );
  const loading = useSelector(
    (state) => state.postOutstandingReducer.loading["outstandingInvoices"]
  );

  const [expandedPartners, setExpandedPartners] = useState({});
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("group");




  const fetchOutstanding = useCallback(() => {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "account.move",
        method: "search_read",
        args: [
          [
            ["move_type", "=", "out_invoice"],
            ["state", "=", "posted"],
            ["payment_state", "!=", "paid"],
          ],
        ],
        kwargs: {
          fields: ["id", "name", "missed_days", "amount_residual", "partner_id"],
        },
      },
    };
    dispatch(postOutstanding(payload, "outstandingInvoices"));
  }, [dispatch]);

  useEffect(() => {
    fetchOutstanding();
  }, [fetchOutstanding]);

  // 🔍 Filter for list view
  const filteredListData = useMemo(() => {
    if (!searchText.trim()) return outstandingInvoicesData;
    const searchLower = searchText.toLowerCase();

    return outstandingInvoicesData.filter((inv) => {
      const partnerName = inv.partner_id?.[1]?.toString().toLowerCase() || "";
      const invoiceName = inv.name?.toString().toLowerCase() || "";
      const missedDays =
        inv.missed_days !== undefined && inv.missed_days !== null
          ? inv.missed_days.toString().toLowerCase()
          : "";
      const amount = inv.amount_residual?.toString().toLowerCase() || "";

      return (
        partnerName.includes(searchLower) ||
        invoiceName.includes(searchLower) ||
        missedDays.includes(searchLower) ||
        amount.includes(searchLower)
      );
    });
  }, [outstandingInvoicesData, searchText]);

  const groupedData = useMemo(() => {
    const grouped = outstandingInvoicesData.reduce((acc, invoice) => {
      const partnerId = invoice.partner_id?.[0] || "unknown";
      if (!acc[partnerId]) {
        acc[partnerId] = {
          partnerName: invoice.partner_id?.[1] || "N/A",
          totalOutstanding: 0,
          invoices: [],
        };
      }
      acc[partnerId].totalOutstanding += invoice.amount_residual || 0;
      acc[partnerId].invoices.push(invoice);
      return acc;
    }, {});

    if (!searchText.trim()) return grouped;

    const filtered = {};
    const searchLower = searchText.toLowerCase();

    Object.entries(grouped).forEach(([partnerId, data]) => {
      const filteredInvoices = data.invoices.filter((inv) => {
        const invoiceName = inv.name?.toString().toLowerCase() || "";
        const missedDays =
          inv.missed_days !== undefined && inv.missed_days !== null
            ? inv.missed_days.toString().toLowerCase()
            : "";
        const amount = inv.amount_residual?.toString().toLowerCase() || "";
        const partnerName = data.partnerName?.toLowerCase() || "";

        return (
          partnerName.includes(searchLower) ||
          invoiceName.includes(searchLower) ||
          missedDays.includes(searchLower) ||
          amount.includes(searchLower)
        );
      });

      if (filteredInvoices.length > 0) {
        filtered[partnerId] = {
          ...data,
          invoices: filteredInvoices,
          totalOutstanding: filteredInvoices.reduce(
            (sum, inv) => sum + (inv.amount_residual || 0),
            0
          ),
        };
      }
    });

    return filtered;
  }, [outstandingInvoicesData, searchText]);

        const handleInvoiceRowPress = (invoice) => {
    console.log("Navigate with invoice ID:", invoice.id);
 navigation.navigate("InvoiceDetails", { invoiceId: invoice.id });
  };

  const toggleExpand = (partnerId) => {
    setExpandedPartners((prev) => ({
      ...prev,
      [partnerId]: !prev[partnerId],
    }));
  };

const renderGroupedItem = ({ item }) => {
  const partnerId = item[0];
  const partnerData = item[1];
  const isExpanded = expandedPartners[partnerId];



  return (
    <View style={styles.partnerContainer}>
      {/* Partner Header */}
      <TouchableOpacity onPress={() => toggleExpand(partnerId)}>
        <View style={styles.partnerRow}>
          <Text style={styles.partnerName}>{partnerData.partnerName}</Text>
          <Text style={styles.partnerTotal}>
            {partnerData.totalOutstanding.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Invoices inside a single card */}
      {isExpanded && partnerData.invoices.length > 0 && (
        <View style={styles.invoiceCard}>
          {/* Header Row */}
          <View style={styles.invoiceCardHeader}>
            <Text style={[styles.invoiceCell, styles.headerText]}>Invoice</Text>
            <Text style={[styles.invoiceCell, styles.headerText]}>Missed Days</Text>
            <Text style={[styles.invoiceCell, styles.headerText]}>Outstanding</Text>
          </View>

          {/* Invoice Rows */}
          {partnerData.invoices.map((invoice) => (
      <TouchableOpacity
    key={invoice.id}
    style={styles.invoiceCardValues}
    onPress={() => handleInvoiceRowPress(invoice)}
  >
    <Text style={styles.invoiceCell}>{invoice.name}</Text>
    <Text style={styles.invoiceCell}>{invoice.missed_days}</Text>
    <Text style={styles.invoiceCell}>
      {invoice.amount_residual.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}
    </Text>
  </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


  const renderListItem = ({ item }) => (
<View style={styles.card}>
  <Text style={styles.cardText}>
    <Text style={styles.labelText}>Partner: </Text>
    <Text style={styles.valueText}>{item.partner_id?.[1] || "N/A"}</Text>
  </Text>
    <TouchableOpacity onPress={() => handleInvoiceRowPress(item)}>
      <Text style={styles.cardText}>
        <Text style={styles.labelText}>Invoice: </Text>
        <Text style={styles.valueText}>{item.name}</Text>
      </Text>
    </TouchableOpacity>

  <Text style={styles.cardText}>
    <Text style={styles.labelText}>Missed Days: </Text>
    <Text style={styles.valueText}>{item.missed_days}</Text>
  </Text>

  <Text style={styles.cardText}>
    <Text style={styles.labelText}>Outstanding: </Text>
    <Text style={styles.valueText}>
      {item.amount_residual.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}
    </Text>
  </Text>
</View>

  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3966c2" />
        <Text>Loading Outstanding Invoices...</Text>
      </View>
    );
  }

  const totalOutstanding =
    viewMode === "group"
      ? Object.values(groupedData).reduce(
          (sum, p) => sum + p.totalOutstanding,
          0
        )
      : filteredListData.reduce((sum, inv) => sum + (inv.amount_residual || 0), 0);

  return (
        <ImageBackground
          source={require("../../../../assets/backgroundimg.png")}
          style={styles.background}
          resizeMode="cover"
        >
    <View style={{ flex: 1 }}>
      {/* 🔹 Outstanding Amount Header */}
      <View style={styles.headerSummary}>
        <Text style={styles.headerLabel}>Outstanding List</Text>
      </View>

      {/* 🔹 Search + Icons */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search "
          placeholderTextColor="#dcdcdc" 
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={() => setViewMode("group")}
            style={viewMode === "group" ? styles.activeIcon : null}
          >
            <Icon name="group" size={24} color="#ffffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            style={viewMode === "list" ? styles.activeIcon : null}
          >
            <Icon name="list" size={24} color="#ffffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Count + Total Row */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {viewMode === "group"
            ? `Total Partners: ${Object.keys(groupedData).length}`
            : `Total Invoices: ${filteredListData.length}`}
        </Text>
        <Text style={styles.countText}>
          Total:{" "}
          {totalOutstanding.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </Text>
      </View>

      {/* 🔹 Main List */}
      {viewMode === "group" ? (
        <FlatList
          data={Object.entries(groupedData)}
          keyExtractor={(item) => item[0]}
          renderItem={renderGroupedItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No outstanding invoices found.
            </Text>
          }
          contentContainerStyle={{ padding: 15 }}
        />
      ) : (
        <FlatList
          data={filteredListData}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderListItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No outstanding invoices found.
            </Text>
          }
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
    </ImageBackground>
  );
};

export default Outstanding;

const styles = StyleSheet.create({
    background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerSummary: {
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: "15%",
  },
  headerLabel: { fontSize: 20, fontWeight: "600", color: "#fffefeff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
    marginRight: 10,
    color: "#ffffff",
  },
  iconsContainer: { flexDirection: "row", gap: 6 },
  activeIcon: { backgroundColor: "#808082ff", borderRadius: 8, padding: 4 },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 5,
    marginTop: -5,
  },
  countText: { fontSize: 15, fontWeight: "600", color: "#f1f1f1ff" },

  partnerContainer: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#e9e9e9ff",
    borderRadius: 5,
  },
  partnerName: {
    fontWeight: "bold",
    fontSize: 13,
      color: "#250588",
    flex: 1,
    marginRight: 10,
    flexWrap: "wrap",
  },
  partnerTotal: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#250588",
    textAlign: "right",
    flexShrink: 0,
    maxWidth: 120,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,

  },
  invoiceCard: {
  marginHorizontal: 5,
  borderColor: "#3966c2",
  borderRadius: 8,
  backgroundColor: "transparent", 
  overflow: "hidden",
},

invoiceCardHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 6,
  paddingHorizontal: 12,
},

invoiceCardValues: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderBottomColor: "#e8e7e7ff",
},

invoiceCell: { flex: 1, textAlign: "center",  color: "#250588",
    fontWeight: "bold",fontSize:12 },

headerText: { fontWeight: "bold", color: "#878585ff" },

  card: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#e8e7e7ff",
    borderRadius: 8,
  },
  cardText: { fontWeight: "bold", fontSize: 13, marginBottom: 2 },
    labelText: {
    color: "#878585ff",
  },
  valueText: {
    fontWeight: "normal",
    color: "#250588",
    fontWeight: "bold",
  },
});
