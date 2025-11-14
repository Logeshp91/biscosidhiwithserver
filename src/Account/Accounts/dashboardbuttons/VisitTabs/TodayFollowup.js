import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit, postOutstanding, postCustomerList } from "../../../../redux/action";
import OpenEnquiryStyles from "../../Styles/OpenEnquiryStyles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // ensure installed

const PAGE_SIZE = 10;

// ==========================
// Customer Item Component
// ==========================
const CustomerItem = React.memo(({ item }) => {
  const navigation = useNavigation();

  const handleSoPress = (id, soNumber) => {
    console.log("SO Pressed:", id, soNumber);
  };

  return (
    <View>
      <View style={OpenEnquiryStyles.card}>
        <View style={OpenEnquiryStyles.row}>
          <Text style={OpenEnquiryStyles.headerText}>{item.partner_id?.[1] || "-"}</Text>
          <Text style={[OpenEnquiryStyles.headerText, { fontSize: 10 }]}>
            {item.followup_date}
          </Text>
        </View>

        <View style={OpenEnquiryStyles.miniCard}>
          <View style={OpenEnquiryStyles.row}>
            <Text style={OpenEnquiryStyles.title}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleSoPress(item.id, item.so_id?.[1])}>
              <Text
                style={[
                  OpenEnquiryStyles.title,
                  { textDecorationLine: "underline", color: "#250588" },
                ]}
              >
                {item.so_id?.[1] || "-"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={OpenEnquiryStyles.infoRow}>
            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Product</Text>
              <Text style={OpenEnquiryStyles.value}>{item.product_category || "-"}</Text>
            </View>
            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Brand</Text>
              <Text style={OpenEnquiryStyles.value}>{item.brand || "-"}</Text>
            </View>
            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Visit</Text>
              <Text style={OpenEnquiryStyles.value}>{item.outcome_visit || "-"}</Text>
            </View>
            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Status</Text>
              <Text style={OpenEnquiryStyles.value}>{item.state || "-"}</Text>
            </View>
          </View>

          <View
            style={[
              OpenEnquiryStyles.belowrow,
              {
                justifyContent: "space-between",
                alignItems: "center",
                paddingRight: 5,
              },
            ]}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
              <Text style={[OpenEnquiryStyles.label, { marginRight: 5 }]}>Remarks:</Text>
              <Text style={{ fontSize: 12 }}>{item.remarks || "-"}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

// ==========================
// Main Component
// ==========================
const TodayFollowup = ({ searchText = "" }) => {
  const dispatch = useDispatch();

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const roleUserId = useSelector((state) => state.postauthendicationReducer.uid);
  const customerData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const loading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );

  // ================================
  // Get Today’s Date (YYYY-MM-DD)
  // ================================
  const today = new Date().toISOString().split("T")[0]; // auto-sets today dynamically

  // ================================
  // Fetch Follow-ups for Today
  // ================================
  const fetchEnquiries = useCallback(
    (pageNumber = 0, searchText = "") => {
      const domain = [["followup_date", "=", today]]; // ✅ dynamic date

      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "customer.visit",
          method: "search_read",
          args: [],
          kwargs: {
            domain,
            fields: [
              "id",
              "name",
              "partner_id",
              "state",
              "followup_date",
              "brand",
              "visit_purpose",
              "product_category",
              "required_qty",
              "remarks",
              "so_id",
              "outcome_visit",
              "lost_reason",
              "create_date",
              "billing_branch_id",
              "billing_type",
              "incoterm_id",
              "payment_term_id",
            ],
            order: "id desc",
            limit: PAGE_SIZE,
            offset: pageNumber * PAGE_SIZE,
          },
        },
      };

      console.log("📦 Fetching followups for:", today);
      dispatch(postcreatevisit(payload, "openEnquiryList"));
    },
    [dispatch, today]
  );

  // ================================
  // Initial Load
  // ================================
  useEffect(() => {
    if (!roleUserId) return;
    setPage(0);
    setHasMore(true);
    setIsFetchingMore(false);
    setCustomers([]);
    fetchEnquiries(0, searchText);
  }, [searchText, fetchEnquiries, roleUserId]);

  // ================================
  // When API Data Changes
  // ================================
  useEffect(() => {
    if (!customerData) return;
    const updatedList = Array.isArray(customerData) ? customerData : [];
    if (page === 0) {
      setCustomers(updatedList);
    } else if (updatedList.length > 0) {
      setCustomers((prev) => [...prev, ...updatedList]);
    } else {
      setHasMore(false);
    }
    setIsFetchingMore(false);
  }, [customerData]);

  // ================================
  // Count Today’s Followups
  // ================================
  useEffect(() => {
    const domain = [["followup_date", "=", today]];

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_count",
        args: [domain],
        kwargs: {},
      },
    };

    dispatch(postCustomerList(payload, "todayFollowupCount"));
  }, [dispatch, today]);

  // ================================
  // Load More (Pagination)
  // ================================
  const loadMore = () => {
    if (!loading && hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchEnquiries(nextPage, searchText);
    }
  };

  // ================================
  // Loader
  // ================================
  if (loading && page === 0 && customers.length === 0) {
    return (
      <View style={OpenEnquiryStyles.loader}>
        <ActivityIndicator size="large" color="#c7c9cdff" />
        <Text style={OpenEnquiryStyles.loaderText}>Loading Customers...</Text>
      </View>
    );
  }

  // ================================
  // Render List
  // ================================
  return (
    <View style={{ flex: 1 }}>
      {customers.length === 0 ? (
        <View style={OpenEnquiryStyles.center}>
          <Text>No customers found for today’s follow-up ({today})</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({ item }) => <CustomerItem item={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ padding: 10, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#888" />
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default TodayFollowup;
