import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit } from "../../../redux/action";

const ProductList = () => {
  const dispatch = useDispatch();
  const partnersData = useSelector(
    (state) => state.postcreatevisitReducer.data["partners"] || []
  );
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [quantities, setQuantities] = useState({});

  const fetchAllAtOnce = () => {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "item.master",
        method: "search_read",
        args: [],
        kwargs: {
          fields: [
            "id",
            "sku",
            "item_name",
            "item_type",
            "item_size",
            "width",
            "length",
            "grade",
            "sales_taxes",
            "purchase_taxes",
            "product_type",
            "manufacturer",
            "product_categ_id",
            "item_code",
          ],
          limit: 0,
        },
      },
    };
    dispatch(postcreatevisit(payload, "partners"));
  };

  useEffect(() => {
    fetchAllAtOnce();
  }, []);

  useEffect(() => {
    if (partnersData.length > 0) {
      setPartners(partnersData);
      setFilteredPartners(partnersData);
      setLoading(false);
    }
  }, [partnersData]);

  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();

    const filtered = partners.filter((item) => {
      const safe = (val) =>
        val !== undefined && val !== null ? val.toString().toLowerCase() : "";
      return (
        safe(item.item_name).includes(lowerText) ||
        safe(item.item_type).includes(lowerText) ||
        safe(item.item_size).includes(lowerText) ||
        safe(item.width).includes(lowerText) ||
        safe(item.length).includes(lowerText) ||
        safe(item.grade).includes(lowerText)
      );
    });
    setFilteredPartners(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getTextValue = (field) => {
  if (Array.isArray(field)) return field[1] || "-"; 
  if (field === null || field === undefined || field === "") return "-";
  return field.toString();
};

  const renderItem = ({ item }) => {
    const expanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>{item.sku || "-"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Item Name</Text>
          <Text style={styles.label}>Item Size</Text>
        </View>
        <View style={styles.row}>
<Text style={styles.value}>{getTextValue(item.item_name)}</Text>
<Text style={styles.value}>{getTextValue(item.item_size)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Item Type</Text>
          <Text style={styles.label}>Item Width</Text>
        </View>
        <View style={styles.row}>
<Text style={styles.value}>{getTextValue(item.item_type)}</Text>
<Text style={styles.value}>{getTextValue(item.width)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Grade</Text>
          <Text style={styles.label}>Item Length</Text>
        </View>
        <View style={styles.row}>
<Text style={styles.value}>{getTextValue(item.grade)}</Text>
<Text style={styles.value}>{getTextValue(item.length)}</Text>
        </View>

        {expanded && (
          <View style={styles.expandSection}>
<View style={styles.row3}>
  <View style={styles.col}>
    <Text style={styles.label}>Product Type</Text>
<Text style={styles.value}>{getTextValue(item.product_type)}</Text>
  </View>
  <View style={styles.col}>
    <Text style={styles.label}>Manufacturer</Text>
<Text style={styles.value}>{getTextValue(item.manufacturer)}</Text>
  </View>
  <View style={styles.col}>
    <Text style={styles.label}>Sales Taxes</Text>
<Text style={styles.value}>{getTextValue(item.sales_taxes)}</Text>

  </View>
</View>
<View style={styles.row3}>
  <View style={styles.col}>
    <Text style={styles.label}>Product Category</Text>
<Text style={styles.value}>{getTextValue(item.product_categ_id)}</Text>
  </View>
  <View style={styles.col}>
    <Text style={styles.label}>Item Code</Text>
<Text style={styles.value}>{getTextValue(item.product_categ_id)}</Text>
  </View>
  <View style={styles.col}>
    <Text style={styles.label}>Purchase Taxes</Text>
<Text style={styles.value}>{getTextValue(item.purchase_taxes)}</Text>
  </View>
</View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPartners}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </ImageBackground>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    marginVertical: 50,
    marginHorizontal: 5,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
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
  headerRow: {
    justifyContent: "center",
    backgroundColor: "#6072C7",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerRowText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 4,
  },
  row3: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 10,
  marginTop: 8,
},

col: {
  flex: 1,
  alignItems: "flex-start",
  marginHorizontal: 5,
},

label: {
  fontWeight: "bold",
  color: "#878585ff",
  fontSize: 10,
  marginBottom: 2,
},

value: {
  fontWeight: "bold",
  color: "#250588",
  fontSize: 12,
  marginBottom: 6,
},

quantityRow: {
  flexDirection: "row",
  alignItems: "flex-end",
  marginTop: 10,
  marginHorizontal: 10,
},

qtyInput: {
  height: 38,
  borderColor: "#ccc",
  borderWidth: 1,
  borderRadius: 6,
  paddingHorizontal: 8,
  backgroundColor: "#f9f9f9",
  marginTop: 4,
  marginBottom:10
},

addButton: {
  backgroundColor: "#6072C7",
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 8,
  marginLeft: 10,
  alignSelf: "flex-end",
  marginBottom:10
},

addButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 13,
},

  expandSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
 
});
