import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, ScrollView, BackHandler, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Animatable from 'react-native-animatable';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit } from '../../../redux/action';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AddItemModal from './VisitTabs/Utilities/AdditemModal';

const CreateVisit = () => {
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState(null);
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [brand, setBrand] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [quantityTons, setQuantityTons] = useState('');
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [hasAddedItems, setHasAddedItems] = useState(false);
  const [StockQty, setStockQty] = useState('');
  const [enquiryChannel, setEnquiryChannel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [visitId, setVisitId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemsList, setItemsList] = useState([]);

  const dispatch = useDispatch();

  const navigation = useNavigation();
  const postcreatevisitData = useSelector(state => state.postcreatevisitReducer.data);
  const enquiryOptions = postcreatevisitData?.enquiryChannel || [];
  const customerOptions = postcreatevisitData?.customer || [];
  const productcategoryOptions = postcreatevisitData?.productcategory || [];
  const itembrandOptions = postcreatevisitData?.itembrand || [];

  const isCustomerOptions = [
    { label: 'New', value: 'NEW' },
    { label: 'Existing', value: 'EXISTING' },
  ];
  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'OpenEnquiry' }],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  const items = {
    utm_model: "utm.source",
    utm_method: "search_read",
    utm_args: [],
    utm_fields: ["id", "name"],

    res_model: "res.partner",
    res_method: "search_read",
    res_args: [],
    res_fields: ["id", "name"],

    visit_model: "customer.visit",
    visit_method: "search_read",
    visit_args: [],
    visit_fields: ["customer_state"],

    product_model: "product.category",
    product_method: "search_read",
    product_args: [],
    product_fields: ["id", "name"],

    brand_model: "item.brand",
    brand_method: "search_read",
    brand_args: [],
    brand_fields: ["id", "name"],
  }

  const dataParams = (name) => ({
    jsonrpc: "2.0",
    method: "call",
    params: {
      model: items[`${name}_model`],
      method: items[`${name}_method`],
      args: items[`${name}_args`],
      kwargs: {
        fields: items[`${name}_fields`]
      },
    }
  })

  useEffect(() => {
    if (postcreatevisitData?.visitId) {
      setVisitId(postcreatevisitData.visitId);
      setIsSubmitted(true);
    }
  }, [postcreatevisitData]);
  useEffect(() => {
    if (enquiryChannel && customerName && purposeOfVisit && brand && productCategory && (purposeOfVisit === 'STOCK' ? StockQty : quantityTons) && remarks) {
      setIsFormFilled(true);
    } else {
      setIsFormFilled(false);
    }
  }, [enquiryChannel, customerName, purposeOfVisit, brand, productCategory, StockQty, quantityTons, remarks]);

  const onHandleEnquiryChannel = () => {
    dispatch(postcreatevisit(dataParams("utm"), "enquiryChannel"));
  };

  const onHandleCustomer = () => {
    dispatch(postcreatevisit(dataParams("res"), "customer"))
  };
  const onHandleProductCategory = () => {
    dispatch(postcreatevisit(dataParams("product"), "productcategory"));
  };
  const onHandleItemBrand = () => {
    dispatch(postcreatevisit(dataParams("brand"), "itembrand"));
  };

  const handleSave = async () => {
    if (!enquiryChannel || !customerName || !purposeOfVisit || !brand || !productCategory || !(purposeOfVisit === 'STOCK' ? StockQty : quantityTons) || !remarks) {
      alert("Please fill all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    const visitPayload = {
      customer_state: selectedCustomerType,
      enquiry_type: enquiryChannel,
      partner_id: customerName,
      visit_purpose: purposeOfVisit,
      brand: brand,
      product_category: productCategory,
      remarks: remarks,
      stock_qty: purposeOfVisit === 'STOCK' ? Number(StockQty) : undefined,
      required_qty: purposeOfVisit !== 'STOCK' ? Number(quantityTons) : undefined,
    };

    const data = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "create",
        args: [visitPayload],
        kwargs: {}
      }
    };

    try {
      const response = await dispatch(postcreatevisit(data, "visitId"));
      console.log("API Response:", response?.data);
      const id = response?.data?.result || response?.data?.visitId;
      if (id) {
        setVisitId(id);
        setIsSaved(true);
        alert("Visit saved successfully!");
      } else {
        alert("Visit saved successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting visit.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSubmit = async () => {
    if (!visitId) {
      alert("Please save the visit first before submitting items.");
      return;
    }

    if (itemsList.length === 0) {
      alert("No items to submit.");
      setIsSubmitting(false)
      return;
    }

    setIsSubmitting(true);

    try {
      for (const item of itemsList) {
        const visitPayload = {
          visit_id: visitId,
          product_id: item.product_id,
          manufacturer: item.manufacturer,
          item_size: item.item_size,
          width: item.width,
          length: item.length,
          quantity: item.quantity,
          nos: item.nos,
          cust_price_unit: item.cust_price_unit,
          stock_available: item.stock_available,
          product_categ_id: item.product_categ_id,
          sale_type: item.sale_type
        };

        const data = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "visit.product.line",
            method: "create",
            args: [visitPayload],
            kwargs: {}
          }
        };

        await dispatch(postcreatevisit(data, "lineitems"));
      }

      alert("All items submitted successfully!");
      setItemsList([]);
      setHasAddedItems(false);
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      alert("Error submitting items.");
    } finally {
      setIsSubmitting(true);
    }
  };


  const handleVisited = async () => {
    if (!visitId) {
      alert("No visit ID found. Please submit first.");
      return;
    }

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "write",
        args: [[visitId], { state: "visted" }],
        kwargs: {}
      }
    };

    try {
      await dispatch(postcreatevisit(payload));
      navigation.navigate('OpenEnquiry')
      console.log("visiteddd", postcreatevisit)
      console.log("payload", payload);
      alert("Visit marked as visited!");
    } catch (error) {
      console.error(error);
      alert("Error marking visit as visited.");
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/backgroundimg.png')}
      style={{ flex: 1, resizeMode: 'cover', padding: 20 }}
    >
      <View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Visit</Text>

          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.dropdowntitle, {}]}>Enquiry Channel</Text>
          </View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={100}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

              <Dropdown
                style={styles.dropdownmain}
                data={enquiryOptions.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Enquiry Channel"
                placeholderStyle={styles.dropdownPlaceholderText}
                selectedTextStyle={styles.dropdownSelectedText}
                value={enquiryChannel}
                onFocus={onHandleEnquiryChannel}
                onChange={item => setEnquiryChannel(item.value)}
              />
              <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                {isCustomerOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}
                    onPress={() => setSelectedCustomerType(option.value)}
                  >
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#ffffffff',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {selectedCustomerType === option.value && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 6,
                            backgroundColor: '#ffffffff',
                          }}
                        />
                      )}
                    </View>
                    <Text style={{ color: '#fff', marginLeft: 6, fontSize: 14 }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          </Animatable.View>

          <Text style={styles.dropdowntitle}>Customer Name</Text>
          <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
            <Dropdown
              style={styles.dropdownmain1}
              data={customerOptions.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Customer"
              value={customerName}
              placeholderStyle={styles.dropdownPlaceholderText}
              selectedTextStyle={styles.dropdownSelectedText}
              onFocus={onHandleCustomer}
              onChange={item => setCustomerName(item.value)}
              search
              searchPlaceholder="Search Customer"
            />

          </Animatable.View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdowntitle, { textAlign: 'left' }]}>
                Purpose of Visit
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdowntitle, { textAlign: 'left', marginLeft: "4%" }]}>
                Brand
              </Text>
            </View>
          </View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={styles.dropdownmain}
                data={[
                  { label: 'Sales Enquiry', value: 'SALESCALL' },
                  { label: 'Regular Followup', value: 'REGULAR', },
                  { label: 'Stock Check', value: 'STOCK', },
                  { label: 'Payment Collection', value: 'PAYMENT', },
                  { label: 'Fields with Sales Officer', value: 'SITE', },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Purpose of Visit"
                value={purposeOfVisit}
                onChange={item => setPurposeOfVisit(item.value)}
                placeholderStyle={styles.dropdownPlaceholderText}
                selectedTextStyle={styles.dropdownSelectedText} />
              <Dropdown
                style={styles.dropdownmain}
                data={itembrandOptions.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Brand"
                value={brand}
                onFocus={onHandleItemBrand}
                onChange={item => setBrand(item.value)}
                placeholderStyle={styles.dropdownPlaceholderText}
                selectedTextStyle={styles.dropdownSelectedText} search
                searchPlaceholder="Search Brand"
              />

            </View>
          </Animatable.View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdowntitle, { textAlign: 'left' }]}>
                Product Category
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdowntitle, { textAlign: 'left', marginLeft: "4%" }]}>
                Qty (Tons)
              </Text>
            </View>
          </View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={900}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={styles.dropdownmain}
                data={productcategoryOptions.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder="Product Category"
                value={productCategory}
                onChange={item => setProductCategory(item.value)}
                onFocus={onHandleProductCategory}
                placeholderStyle={styles.dropdownPlaceholderText}
                selectedTextStyle={styles.dropdownSelectedText} search
                searchPlaceholder="Search Product Category"
              />

              {purposeOfVisit === 'STOCK' ? (
                <TextInput
                  style={styles.inputBoxcustomerfieldqty}
                  placeholder="Stock Qty"
                  placeholderTextColor="#c6c4c4"
                  value={StockQty}
                  onChangeText={setStockQty}
                  keyboardType="numeric"
                />
              ) : (
                <TextInput
                  style={styles.inputBoxcustomerfieldqty}
                  placeholder="Qty"
                  placeholderTextColor="#c6c4c4"
                  value={quantityTons}
                  onChangeText={setQuantityTons}
                  keyboardType="numeric"
                />
              )}
            </View>
          </Animatable.View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>

            <Text style={styles.dropdowntitle}>Remarks</Text>
            <TextInput
              style={[styles.dropdownmain, { width: '100%' }]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Enter remarks"
              placeholderTextColor="#c6c4c4"
            />
          </Animatable.View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={1500}>

            <TouchableOpacity
              style={[styles.savebutton, { opacity: isFormFilled && !hasAddedItems ? 1 : 0.5 }]}
              onPress={handleSave}
              disabled={!isFormFilled || hasAddedItems || isSaved}
            >
              <Text style={styles.savebuttonText}>Save</Text>
            </TouchableOpacity>
          </Animatable.View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={1700}>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => {
                setModalVisible(true);
                setHasAddedItems(true);
              }}
            >
              <Text style={styles.additem}>Add Items </Text>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </Animatable.View>

          <View style={{ marginBottom: 10 }}>
            {hasAddedItems && itemsList.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <ScrollView
                  style={{ paddingVertical: 1 }}
                  showsVerticalScrollIndicator={true}
                >
                  {itemsList.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: '#f2f2f2',
                        padding: 8,
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4, color: '#020e94ff' }}>
                          {item.detail || 'Item'}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={styles.itemListLabel}>Type</Text>
                          <Text style={styles.itemListLabel}>Nos</Text>
                          <Text style={styles.itemListLabel}>Qty</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={styles.itemListValue}>{item.sale_type || '-'}</Text>
                          <Text style={[styles.itemListValue, { marginLeft: '2%' }]}>{item.nos || '-'}</Text>
                          <Text style={styles.itemListValue}>{item.quantity || 0}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.itemListLabel}>Stock Available : </Text>
                            <Text style={{ fontSize: 11, color: item.stock_available ? 'green' : 'red' }}>
                              {item.stock_available ? 'Yes' : 'No'}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.itemListLabel}>Ask Price : </Text>
                            <Text style={styles.itemListValue}>₹ {item.cust_price_unit || 0}</Text>
                          </View>
                        </View>

                      </View>
                      <TouchableOpacity
                        style={{
                          alignSelf: 'center',
                          paddingHorizontal: 4,
                        }}
                        onPress={() => {
                          const updatedList = itemsList.filter((_, i) => i !== index);
                          setItemsList(updatedList);
                        }}>
                        <Ionicons name="trash-outline" size={18} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          <Animatable.View animation="fadeInUp" duration={1000} delay={1700}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { opacity: visitId && itemsList.length > 0 ? 1 : 0.5 },
                ]}
                onPress={handleSubmit}
                disabled={!(visitId && itemsList.length > 0)}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { opacity: isFormFilled ? 1 : 0.5 }]}
                onPress={handleVisited}
                disabled={!isFormFilled}>
                <Text style={styles.buttonText}>Visited</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
          <AddItemModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onAddItem={item => setItemsList([...itemsList, item])}
            dropdownOptions={[
              productcategoryOptions.map(i => ({ label: i.name, value: i.id })),
              itembrandOptions.map(i => ({ label: i.name, value: i.id })),
              enquiryOptions.map(i => ({ label: i.name, value: i.id })),
              customerOptions.map(i => ({ label: i.name, value: i.id })),
              [],
              [],
            ]}
          />

        </ScrollView>
      </View>
    </ImageBackground>
  );
};
export default CreateVisit;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: '#b816b5ff',
    marginTop: '15%',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10%',
  },
  dropdowntitle: {
    fontSize: 11.5,
    color: '#fffefeff',
    marginTop: '2%',
    fontWeight: 'bold',
  },
  dropdownSelectedText: {
    fontSize: 13,
    color: '#020e94ff',
    fontWeight: '600'
  },
  dropdownPlaceholderText: {
    fontSize: 12,
    color: '#c6c4c4ff',
  },
  dropdownmain1: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: '2%',
  },
  dropdownmain: {
    height: 40,
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: '2%',
    color: '#020e94ff',
    fontWeight: '600'
  },
  inputBoxcustomerfieldqty: {
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#fff',
    padding: 10,
    width: '48%',
    marginBottom: '2%',
    color: '#020e94ff',
    fontWeight: '600'
  },
  button: {
    backgroundColor: '#020e94ff',
    width: '35%',
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '10%',
    justifyContent: 'center',
  },
  savebutton: {
    backgroundColor: '#020e94ff',
    width: '35%',
    height: 40,
    borderRadius: 15,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: "5%"
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savebuttonText: {
    color: '#fff',
    fontSize: 12,
  },
  additem: {
    color: '#ffffffff',
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: "center",
    marginTop: "3%",
  },
  itemListLabel:
    { fontSize: 11, color: '#616161ff' },
  itemListValue:
    { fontSize: 12, color: '#020e94ff', fontWeight: '600' },
});
