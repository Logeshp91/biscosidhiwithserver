import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { postOutstanding, postCustomerList } from "../../../../redux/action";
import Icon from "react-native-vector-icons/FontAwesome"; 

const InvoiceDetails = () => {
  const route = useRoute();
  const { invoiceId } = route.params;
  const dispatch = useDispatch();

  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch invoice header details
  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "account.move",
            method: "search_read",
            args: [],
            kwargs: {
              domain: [["id", "=", invoiceId]],
              fields: [
                "name",
                "partner_id",
                "invoice_date",
                "amount_total",
                "state",
                "invoice_line_ids",
                "company_id",
                "partner_shipping_id",
                "l10n_in_transporter_id",
                "l10n_in_vehicle_no",
                "invoice_payment_term_id",
                "delivery_date",
                "journal_id",
                "billing_branch_id",
                "invoice_incoterm_id",
                "amount_untaxed",
                "amount_tax",
              ],
            },
          },
        };

        dispatch(
          postOutstanding(payload, "InvoiceDetails", (res) => {
            if (res && res.length > 0) {
              setInvoiceData(res[0]);
            } else {
              setInvoiceData(null);
            }
            setLoading(false);
          })
        );
      } catch (err) {
        console.error("Error fetching invoice details:", err);
        setError("Failed to load invoice details.");
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  // ✅ Fetch invoice product lines
  useEffect(() => {
    if (!invoiceData?.invoice_line_ids?.length) return;

    const fetchInvoiceLines = async () => {
      try {
        const payload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "account.move.line",
            method: "search_read",
            args: [],
            kwargs: {
              domain: [["id", "in", invoiceData.invoice_line_ids]],
              fields: [
                "product_id",
                "quantity",
                "product_uom_id",
                "price_unit",
                "price_subtotal",
              ],
            },
          },
        };

        dispatch(
          postCustomerList(payload, "InvoiceLines", (res) => {
            setInvoiceLines(res || []);
          })
        );
      } catch (err) {
        console.error("Error fetching invoice line details:", err);
      }
    };

    fetchInvoiceLines();
  }, [invoiceData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading invoice details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  if (!invoiceData) {
    return (
      <View style={styles.center}>
        <Text>No invoice details found.</Text>
      </View>
    );
  }

  const totalUntaxed = invoiceData.amount_untaxed || 0;
  const totalTax = invoiceData.amount_tax || 0;
  const totalAmount = invoiceData.amount_total || 0;

  return (
    <ImageBackground
      source={require("../../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.title}>{invoiceData.name}</Text>
        <Text style={styles.companyValue}>{invoiceData.company_id?.[1] || "-"}</Text>

<View >
  <View style={styles.detailRow}>
    <Text style={styles.label}>🧾 Customer:</Text>
        <Text style={styles.label}>📦 Shipping To:</Text>

  </View>

  <View style={styles.detailRow}>
        <Text style={styles.value}>{invoiceData.partner_id?.[1] || "-"}</Text>

    <Text style={styles.value}>{invoiceData.partner_shipping_id?.[1] || "-"}</Text>
  </View>

  <View style={styles.detailRow}>
    <Text style={styles.label}>📅 Invoice Date:</Text>
    <Text style={styles.label}>📆 Delivery Date:</Text>
  </View>



  <View style={styles.detailRow}>
    <Text style={styles.value}>{invoiceData.invoice_date || "-"}</Text>
    <Text style={styles.value}>{invoiceData.delivery_date || "-"}</Text>
  </View>

  <View style={styles.detailRow}>
    <Text style={styles.label}>💳 Payment Term:</Text>
        <Text style={styles.label}>🏬 Branch:</Text>

  </View>

  <View style={styles.detailRow}>
        <Text style={styles.value}>{invoiceData.invoice_payment_term_id?.[1] || "-"}</Text>

    <Text style={styles.value}>{invoiceData.billing_branch_id?.[1] || "-"}</Text>
  </View>

  <View style={styles.detailRow}>
    <Text style={styles.label}>🌐 Incoterm:</Text>
        <Text style={styles.label}>🧾 Journal:</Text>

  </View>

  <View style={styles.detailRow}>
        <Text style={styles.value}>{invoiceData.invoice_incoterm_id?.[1] || "-"}</Text>

    <Text style={styles.value}>{invoiceData.journal_id?.[1] || "-"}</Text>
  </View>
    <View style={styles.detailRow}>
    <Text style={styles.label}>🚚 Transporter:</Text>
        <Text style={styles.label}>🚗 Vehicle No:</Text>
  </View>
  <View style={styles.detailRow}>
        <Text style={styles.value}>{invoiceData.l10n_in_transporter_id?.[1] || "-"}</Text>
    <Text style={styles.value}>{invoiceData.l10n_in_vehicle_no || "-"}</Text>
  </View>
</View>

        <View style={styles.productsCard}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <Icon
              name="list-alt"
              size={20}
              color="#24bc99"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.productsHeader}>Product Details</Text>
          </View>

          {invoiceLines.length > 0 ? (
            invoiceLines.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.leftSection}>
                  <Text style={styles.productName}>
                    {item.product_id?.[1] || "Unnamed Product"}
                  </Text>
                  <Text style={styles.productDetail}>
                    Qty: {item.quantity} × ₹{item.price_unit?.toFixed(2)}{" "}
                    ({item.product_uom_id?.[1] || ""})
                  </Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.totalValue}>
                    ₹{item.price_subtotal?.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: "center", marginTop: 10,color: "#fff" }}>
              No products found.
            </Text>
          )}
          <View style={styles.summaryInsideCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Untaxed:</Text>
              <Text style={styles.summaryValue}>₹ {totalUntaxed}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (GST):</Text>
              <Text style={styles.summaryValue}>₹ {totalTax}</Text>
            </View>
            <View
              style={[
                styles.summaryRow,
                { borderTopWidth: 0.2, borderTopColor: "#ccc", paddingTop: 5 },
              ]}
            >
              <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
                Total Amount:
              </Text>
              <Text style={[styles.summaryValue, { fontWeight: "bold" }]}>
                ₹ {totalAmount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {  textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: "10%", color: "#fff"},

companyValue: {
  fontSize: 13,
  color: "#fff",
  flex: 1.8,
  textAlign: "center",
  marginTop:"2%"
},
detailRow:{
flexDirection:"row",
justifyContent:"space-between"
},
label: {
  fontSize: 13,
  fontWeight: "600",
  color: "#24bc99",
  flex: 1.2,
},

value: {
  fontSize: 13,
  color: "#fff",
  flex: 1.8,
},

  productsCard: {
    backgroundColor: "transparent",
    borderRadius: 1,
    padding: 15,
    marginTop: 15,
    shadowColor: "#ffffffff",
    shadowOpacity: 8,
    shadowOffset: { width: 10, height: 10 },
    shadowRadius: 8,
    elevation: 2,
  },
  productsHeader: { fontSize: 14, fontWeight: "600", color: "#24bc99" },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftSection: { flex: 2 },
  rightSection: { flex: 1, alignItems: "flex-end" },
  productName: { fontSize: 13, fontWeight: "600", color: "#fff" },
  productDetail: { fontSize: 11, color: "#fff", marginLeft: "5%" },
  totalValue: { fontSize: 12, fontWeight: "700", color: "#fff", marginRight: 5 },
  summaryInsideCard: {
    borderTopWidth: 0.3,
    borderTopColor: "#b1b1b1",
    paddingTop: 8,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: { flex: 1, fontSize: 12, color: "#fff" },
  summaryValue: { fontSize: 12, fontWeight: "500", color: "#fff" },
});

export default InvoiceDetails;
