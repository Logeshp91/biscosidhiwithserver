import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { postCustomerList } from "../../../../redux/action";
import Icon from "react-native-vector-icons/MaterialIcons";

const Deliveries = () => {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [moveLines, setMoveLines] = useState({});
  const [loadingMoveId, setLoadingMoveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("allocated");
  const [subFilter, setSubFilter] = useState("assigned");

  const postCustomerListData = useSelector(
    (state) => state.postCustomerListReducer.data?.DeliveriesList || []
  );

  // Fetch deliveries safely
  const fetchDeliveries = () => {
    setLoading(true);

    let domain = [];
    if (filterStatus === "allocated") {
      domain = [["picking_code", "=", "alloc"]];
      if (subFilter) domain.push(["state", "=", subFilter]);
    } else if (filterStatus === "do") {
      domain = [["picking_code", "=", "do"]];
      if (subFilter === "assigned") {
        domain.push(["state", "!=", "done"]);
        domain.push(["state", "!=", "cancel"]);
      } else if (subFilter) {
        domain.push(["state", "=", subFilter]);
      }
    }

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "stock.picking",
        method: "search_read",
        args: [],
        kwargs: {
          domain,
          fields: [
            "partner_id",
            "name",
            "company_id",
            "origin",
            "eway_transporter",
            "vehicle_no",
            "driver_name",
            "partner_invoice_id",
            "driver_number",
            "billing_branch_id",
            "state",
          ],
          order: "id desc",
        },
      },
    };

    dispatch(
      postCustomerList(payload, "DeliveriesList", (result) => {
        // Update state AFTER data arrives
        setFilteredPartners(result || []);
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    fetchDeliveries();
  }, [dispatch, filterStatus, subFilter]);

  // Search filter
  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();
    const filtered = postCustomerListData.filter((item) => {
      const itemName = item.name?.toString().toLowerCase() || "";
      const itemCompany = item.company_id?.[1]?.toString().toLowerCase() || "";
      const itemSource = item.origin?.toString().toLowerCase() || "";
      const itemPartner = item.partner_id?.[1]?.toString().toLowerCase() || "";
      return (
        itemName.includes(lowerText) ||
        itemCompany.includes(lowerText) ||
        itemSource.includes(lowerText) ||
        itemPartner.includes(lowerText)
      );
    });
    setFilteredPartners(filtered);
  };

  // Expand / fetch move lines
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    setLoadingMoveId(id);

    const payloadMove = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "stock.move",
        method: "search_read",
        args: [],
        kwargs: {
          domain: [["picking_id", "=", id]],
          fields: [
            "product_id",
            "actual_request",
            "product_uom_qty",
            "quantity",
            "price_unit",
            "product_uom",
          ],
        },
      },
    };

    dispatch(
      postCustomerList(payloadMove, "MoveLines", (result) => {
        setMoveLines((prev) => ({
          ...prev,
          [String(id)]: result || [],
        }));
        setLoadingMoveId(null);
      })
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View>
        <View style={styles.card}>
          <View style={styles.row1}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subTitle}>{item.origin || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact: </Text>
            <Text style={styles.value}>{item.partner_id?.[1] || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Company: </Text>
            <Text style={styles.value}>{item.company_id?.[1] || "N/A"}</Text>
          </View>
          <TouchableOpacity style={styles.expandRow} onPress={() => toggleExpand(item.id)}>
            <Text style={styles.expandText}>View Details</Text>
            <Icon
              name={expandedId === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color="#240b6fff"
            />
          </TouchableOpacity>
        </View>
        {expandedId === item.id && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transport: </Text>
              <Text style={styles.detailValue}>{item.eway_transporter || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Driver: </Text>
              <Text style={styles.detailValue}>{item.driver_name || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Driver Number: </Text>
              <Text style={styles.detailValue}>{item.driver_number || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehicle No: </Text>
              <Text style={styles.detailValue}>{item.vehicle_no || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Billing Branch: </Text>
              <Text style={styles.detailValue}>{item.billing_branch_id?.[1] || "-"}</Text>
            </View>
            <View style={{ borderBottomWidth: 1, borderColor: "#444", marginVertical: 6 }} />
            <Text style={[styles.detailLabel, { marginBottom: 8 }]}>Products:</Text>
            {loadingMoveId === item.id ? (
              <Text style={{ color: "#ddd" }}>Loading products...</Text>
            ) : moveLines[String(item.id)]?.length > 0 ? (
              <View style={styles.productCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                  <View>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeader, { width: 150 }]}>Product</Text>
                      <Text style={[styles.tableHeader, { width: 100 }]}>Request Qty</Text>
                      <Text style={[styles.tableHeader, { width: 80 }]}>Demand</Text>
                      <Text style={[styles.tableHeader, { width: 80 }]}>Quantity</Text>
                      <Text style={[styles.tableHeader, { width: 70 }]}>Price</Text>
                      <Text style={[styles.tableHeader, { width: 80 }]}>Unit</Text>
                    </View>
                    {moveLines[String(item.id)]?.map((move, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 170 }]}>{move.product_id?.[1] || "-"}</Text>
                        <Text style={[styles.tableCell, { width: 80 }]}>{move.actual_request || "-"}</Text>
                        <Text style={[styles.tableCell, { width: 80 }]}>{move.product_uom_qty || "-"}</Text>
                        <Text style={[styles.tableCell, { width: 90 }]}>{move.quantity || "-"}</Text>
                        <Text style={[styles.tableCell, { width: 60 }]}>{move.price_unit || "-"}</Text>
                        <Text style={[styles.tableCell, { width: 80 }]}>{move.product_uom?.[1] || "-"}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : (
              <Text style={{ color: "#ddd" }}>No products found.</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Delivery List</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search deliveries..."
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>
        <Text style={styles.countText}>Count : {filteredPartners.length}</Text>
        <View style={styles.filterContainer}>
          {["allocated", "do"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filterStatus === status && styles.activeFilterButton]}
              onPress={() => {
                setFilterStatus(status);
                setSubFilter(null);
              }}
            >
              <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
                {status === "allocated" ? "Allocated" : "DO"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.subFilterContainer}>
          {(filterStatus === "allocated"
            ? [
                { label: "Ready", value: "assigned" },
                { label: "Waiting", value: "confirmed" },
                { label: "Done", value: "done" },
                { label: "Cancelled", value: "cancel" },
              ]
            : [
                { label: "Ready", value: "assigned" },
                { label: "Cancelled", value: "cancel" },
                { label: "Done", value: "done" },
              ]
          ).map((state) => (
            <TouchableOpacity
              key={state.value}
              style={[styles.subFilterButton, subFilter === state.value && styles.activeSubFilterButton]}
              onPress={() => setSubFilter(state.value)}
            >
              <Text style={[styles.subFilterText, subFilter === state.value && styles.activeSubFilterText]}>
                {state.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#00aced" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            data={filteredPartners}
            keyExtractor={(item, index) => String(item.id || index)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No deliveries found.</Text>}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default Deliveries;


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "15%",
    color: "#e8e8e8ff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  subTitle: {
    fontSize: 14,
    color: "#666",
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
    color: "#868686",
    width: 80,
  },
  value: {
    fontSize: 14,
    color: "#000",
    flexShrink: 1,
  },
  searchContainer: {
    padding: 10,
    marginTop: 15,
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ddddddff",
    marginLeft: 12,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#ffffff33",
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },
  activeFilterButton: {
    backgroundColor: "#240b6fff",
    borderColor: "#240b6fff",
  },
  filterText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  subFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 10,
    marginBottom: 15,
    marginTop: 5,
  },
  subFilterButton: {
    flex: 1,
    backgroundColor: "#ffffff33",
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff55",
  },
  activeSubFilterButton: {
    backgroundColor: "#2a2a72ff",
    borderColor: "#2a2a72ff",
  },
  subFilterText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  activeSubFilterText: {
    color: "#ffffff",
  },
  expandRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  expandText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#210d8fff",
    marginRight: 4,
  },
  detailsCard: {
    backgroundColor: "transparent",
    borderRadius: 1,
    padding: 15,
    marginTop: 5,
    marginBottom: 5,
    shadowColor: "#ffffffff",
    shadowOpacity: 8,
    shadowOffset: { width: 10, height: 10 },
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d0d0d0ff",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: "#ffffffff",
    flexShrink: 1,
  },
  detailText: {
    fontSize: 14,
    color: "#e7e7e7ff",
    marginBottom: 4,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 0,
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#373E89',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  tableCell: {
    color: '#333',
    textAlign: 'center',
    fontSize: 12.5,
    paddingHorizontal: 5,
  },
});