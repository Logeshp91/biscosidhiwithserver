import React, { useEffect, useId, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { postCustomerList, postauthendication } from '../../../redux/action';
import { useNavigation, useFocusEffect } from '@react-navigation/native';


const ApprovedList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userGroups, setUserGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const postCustomerListData = useSelector((state) => state.postCustomerListReducer.data["ApprovedList"]);


  const postCustomerListLoading = useSelector((state) => state.postCustomerListReducer.loading["ApprovedList"]);
  const [enquiries, setEnquiries] = useState([]);


const loadMore = () => {
  if (!hasMore || isFetchingMore || postCustomerListLoading) return;
  if (enquiries.length < PAGE_SIZE) return;
  const nextPage = page + 1;
  setIsFetchingMore(true);
  fetchEnquiries(nextPage, searchText);
  setPage(nextPage);
};




const fetchEnquiries = useCallback((pageNumber = 0, search = "") => {
  if (pageNumber === 0) setEnquiries([]);


  let domain = [["state", "=", "verify"]];


  const searchValue = search.trim();
  if (searchValue !== "") {
    const searchFields = [
      "name",
      "partner_id.name",
      "brand",
      "visit_purpose",
      "product_category",
      "remarks",
      "so_id.name",
      "outcome_visit",
      "followup_date"
    ];


    // Build OR domain properly for Odoo
    let searchDomain = [];
    searchFields.forEach((field, index) => {
      if (index === 0) searchDomain = [[field, "ilike", searchValue]];
      else searchDomain = ["|", [field, "ilike", searchValue], ...searchDomain];
    });


    domain = [...domain, ...searchDomain];
  }


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
          "create_date"
        ],
        limit: PAGE_SIZE,
        offset: pageNumber * PAGE_SIZE,
        order: "id desc"
      }
    }
  };
  dispatch(postCustomerList(payload, "ApprovedList"));
}, [dispatch]);




  useEffect(() => {
      setSearchText("");
      setPage(0);
      setHasMore(true);
      setEnquiries([]);
      fetchEnquiries(0, "");
  }, [dispatch]);


    useEffect(() => {
      fetchEnquiries(0, searchText);
  }, [searchText]);


  useEffect(() => {
    if (!postCustomerListData) return;


    const normalizedData = postCustomerListData.map(item => ({
      id: item.id,
      reference: item.name || "N/A",
      customer_name: Array.isArray(item.partner_id) ? (item.partner_id[1] || "N/A") : "N/A",
      state: Array.isArray(item.state) && item.state[1] ? item.state[1] : item.state || "N/A",
      followup_date: item.followup_date ? new Date(item.followup_date).toLocaleDateString() : "Not Scheduled",
      brand: Array.isArray(item.brand) && item.brand[1] ? item.brand[1] : "N/A",
      product_category: Array.isArray(item.product_category) && item.product_category[1] ? item.product_category[1] : "N/A",
      outcome_visit: Array.isArray(item.outcome_visit) && item.outcome_visit[1] ? item.outcome_visit[1] : item.outcome_visit || "N/A",
      remarks: item.remarks || "N/A",
      so_number: Array.isArray(item.so_id) && item.so_id[1] ? item.so_id[1] : "",
      purpose_of_visit: item.visit_purpose || "N/A",
      create_date: formatDateTime(item.create_date),
    }));


    const visitedEnquiries = normalizedData.filter(item => item.state.toLowerCase() === "verify");


    // Replace for first page, append for next page
    setEnquiries(prev => page === 0 ? visitedEnquiries : [...prev, ...visitedEnquiries]);
    setHasMore(visitedEnquiries.length === PAGE_SIZE);
    setIsFetchingMore(false);


  }, [postCustomerListData]);




  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";


    const isoStr = dateStr.replace(" ", "T");
    const dateObj = new Date(isoStr);


    if (isNaN(dateObj.getTime())) return "N/A";


    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();


    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };


  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Stage1', { enquiryData: item })}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{item.customer_name}</Text>
        <Text style={styles.headerText}>{item.followup_date}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.title}>{item.reference}</Text>
        <Text style={styles.title}>{item.so_number}</Text>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{item.product_category}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Brand</Text>
          <Text style={styles.value}>{item.brand}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Visit</Text>
          <Text style={styles.value}>{item.outcome_visit}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{item.state}</Text>
        </View>
      </View>
      <View style={styles.belowrow}>
        <Text style={styles.remarkslabel}>Remarks: </Text>
        <Text style={styles.value}>{item.remarks}</Text>
      </View>
    </TouchableOpacity>
  );
  if (postCustomerListLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3966c2" />
      </View>
    );
  }
  return (
    <ImageBackground
      source={require("../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.mainTitle}> Approved List</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
        <FlatList
          data={enquiries}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No enquiries found.</Text>}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore && <ActivityIndicator color="#3966c2" />}
        />
      </View>
    </ImageBackground>
  );
};
export default ApprovedList;


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "transparent",
    marginTop: 20
  },
  mainTitle: {
    marginTop: "5%",
    marginBottom: "5%",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center"
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: "purple",
    borderWidth: 1
  },
  card: {
    backgroundColor: "#6072C7",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#6072C7",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },


  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 5,
  },
  miniCard: {
    backgroundColor: "#e8e7e7ff",
    borderRadius: 5,
    padding: 5
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#250588",
    marginLeft: 5
  },
  label: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10
  },
  remarkslabel: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10,
    marginLeft: 5
  },
  value: {
    fontWeight: "bold",
    color: "#250588",
    fontSize: 12,
    textAlign: "center"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#250588"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  belowrow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#acaaaaff"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5
  },
  infoItem: {
    flex: 1,
    alignItems: "center"
  }
});


