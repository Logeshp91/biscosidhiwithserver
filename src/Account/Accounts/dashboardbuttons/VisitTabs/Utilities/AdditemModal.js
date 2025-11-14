import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { postcreatevisit } from '../../../../../redux/action';
import { useDispatch, useSelector } from 'react-redux';

const AddItemModal = ({ visible, onClose, onAddItem }) => {
  const [isStock, setIsStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [itemDetail, setItemDetail] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedThickness, setSelectedThickness] = useState(null);
  const [nos, setNos] = useState('');
  const [selectedWidth, setSelectedWidth] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [selectedLength, setSelectedLength] = useState(null);
  const [askPrice, setAskPrice] = useState('');
  const [biscoPrice, setBiscoPrice] = useState('');
  const [difference, setDifference] = useState('');

  const dispatch = useDispatch();
  const postcreatevisitData = useSelector(state => state.postcreatevisitReducer.data);
  const categoryOptions = postcreatevisitData?.category || [];
  const brandOptions = postcreatevisitData?.brand || [];
  const ProductOptions = useSelector(state => state.postcreatevisitReducer.data.product || []);

  const typeOptions = [
    { label: 'Mts', value: 'mts' },
    { label: 'Sqmt', value: 'sqmt' },
  ];

  const onHandleCategory = () => {
    dispatch(postcreatevisit(dataParams("productcateg"), "category"));
  };

  const onHandleBrand = () => {
    dispatch(postcreatevisit(dataParams("brand"), "brand"));
  };

  const onHandleProduct = () => {
    if (!selectedCategory || !selectedBrand) return;
    dispatch(postcreatevisit(dataParams("productId"), "product"));
  };

  const items = {
    productcateg: {
      model: "product.category",
      method: "search_read",
      args: [],
      domain: [["is_trading", "=", true]],
      fields: ["id", "name"],
    },
    brand: {
      model: "item.brand",
      method: "search_read",
      args: [],
      domain: [],
      fields: ["id", "name"],
    },
    productId: {
      model: "product.product",
      method: "search_read",
      args: [],
      domain: [
        ["type", "=", "consu"],
        ["categ_id", "=", selectedCategory],
        ["manufacturer", "=", selectedBrand],
      ],
      fields: ["id", "name", "item_size", "width", "length", "list_price", "qty_available"],
    },
  };

  const dataParams = (name) => {
    let domain = items[name].domain;
    if (name === "productId") {
      if (!selectedCategory || !selectedBrand) return null;
      domain = [
        ["type", "=", "consu"],
        ["categ_id", "=", selectedCategory],
        ["manufacturer", "=", selectedBrand],
      ];
    }

    return {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: items[name].model,
        method: items[name].method,
        args: items[name].args,
        kwargs: {
          domain: domain,
          fields: items[name].fields,
        },
      },
    };
  };

  useEffect(() => {
    if (itemDetail) {
      const selectedProduct = ProductOptions.find(p => p.id === itemDetail);
      if (selectedProduct) {
    const thicknessData = selectedProduct.item_size && Array.isArray(selectedProduct.item_size)
  ? { id: selectedProduct.item_size[0], name: selectedProduct.item_size[1] }
  : { id: null, name: '' };

const widthData = selectedProduct.width && Array.isArray(selectedProduct.width)
  ? { id: selectedProduct.width[0], name: selectedProduct.width[1] }
  : { id: null, name: '' };

const lengthData = selectedProduct.length && Array.isArray(selectedProduct.length)
  ? { id: selectedProduct.length[0], name: selectedProduct.length[1] }
  : { id: null, name: '' };

        setSelectedThickness(thicknessData);
        setSelectedWidth(widthData);
        setSelectedLength(lengthData);
        setBiscoPrice(String(selectedProduct.list_price || ''));

      }
    }
  }, [itemDetail, ProductOptions]);

  useEffect(() => {
    const ask = parseFloat(askPrice) || 0;
    const bisco = parseFloat(biscoPrice) || 0;
    const diff = ask - bisco;
    setDifference(diff.toFixed(2));
  }, [askPrice, biscoPrice]);

  useEffect(() => {
    if (!selectedType || !nos || !selectedThickness || !selectedLength) {
      setQuantity('');
      return;
    }

    const nos_val = parseFloat(nos) || 0;
    const length_val = parseFloat(selectedLength?.name || selectedLength) || 0; // mm
    const width_val = 1220;
    const thickness_val = parseFloat(selectedThickness?.name || selectedThickness) || 0;

    let finalQuantity = 0;
    let sqmtr = 0;

    if (selectedType === 'sqmt') {
      sqmtr = Math.round((nos_val * length_val * 1.09) / 1000 * 100) / 100;
      finalQuantity = (
        ((width_val * (thickness_val - 0.025) * 7.85) / (1000 * 1.09)) * (sqmtr / 1000)
      ).toFixed(3);
    } else {
      finalQuantity = '0';
    }

    console.log('=== SQMT Calculation ===');
    console.log('Nos:', nos_val);
    console.log('Length (mm):', length_val);
    console.log('Width (mm):', width_val);
    console.log('Thickness (mm):', thickness_val);
    console.log('SQMTR:', sqmtr.toFixed(2));
    console.log('Final Quantity:', finalQuantity);

    setQuantity(finalQuantity);
  }, [selectedType, nos, selectedThickness, selectedLength]);

useEffect(() => {
  if (!itemDetail) {
    if (isStock !== false) setIsStock(false);
    return;
  }


    const selectedProduct = ProductOptions.find(p => p.id === itemDetail);
    if (!selectedProduct || selectedProduct.qty_available == null) {
      console.log('Product not found or qty_available missing');
      setIsStock(false);
      return;
    }

    let enteredValue = 0;
     let enteredNos = 0;
    if (selectedType === 'mts') {
      enteredValue = parseFloat(quantity) || 0;
    } else if (selectedType === 'sqmt') {
      enteredValue = parseFloat(nos) || 0; 
      enteredNos = parseFloat(nos) || 0;      
    }

    console.log('Selected Product:', selectedProduct.name);
    console.log('Type:', selectedType);
    console.log('Entered Value:', enteredValue);
      console.log('Entered Nos:', enteredNos);
    console.log('Available Quantity:', selectedProduct.qty_available);

    const stockStatus = selectedProduct.qty_available >= enteredValue;
    console.log('Stock enough?', stockStatus);

    setIsStock(stockStatus);
  }, [itemDetail, nos, quantity, selectedType, ProductOptions]);


  useEffect(() => {
    setItemDetail(null);
    if (selectedCategory && selectedBrand) {
      onHandleProduct();
    }
  }, [selectedCategory, selectedBrand]);

  const selectedProduct = ProductOptions.find(p => p.id === itemDetail);

  const handleSave = () => {
    if (!selectedCategory || !selectedBrand || !quantity) {
      alert('Please fill all required fields.');
      return;
    }

const item = {
  product_id: selectedProduct?.id || null, 
  manufacturer: selectedBrand || null,        
  item_size: selectedThickness?.id || null,      
  product_categ_id: selectedCategory || null,    
  detail: selectedProduct?.name || '',
  width: parseFloat(selectedWidth?.id || 0),    
  length: parseFloat(selectedLength?.id || 0),  
  quantity: parseFloat(quantity) || 0,
  nos: parseFloat(nos) || 0,
  cust_price_unit: parseFloat(askPrice) || 0,      
  stock_available: isStock,                         
  sale_type: selectedType || 'mts',
  difference: parseFloat(difference) || 0,
};


    onAddItem(item);
    handleClose();
  };

  const handleClose = () => {
    setIsStock(false);
    setSelectedCategory(null);
    setSelectedBrand(null);
    setItemDetail('');
    setSelectedType(null);
    setSelectedThickness('');
    setNos('');
    setSelectedWidth('');
    setQuantity('');
    setSelectedLength('');
    setAskPrice('');
    setBiscoPrice('');
    setDifference('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>Add Item</Text>
            <View style={styles.rowCenter}>
              <TouchableOpacity>
                <View style={{
                  width: 15,
                  height: 15,

                  borderColor: '#020e94',
                  backgroundColor: isStock ? '#28a745' : '#6a6868ff',
                }} />
              </TouchableOpacity>
              <Text style={{ fontSize: 13 }}>  Stock</Text>
            </View>
            <View style={styles.rowSpace}>
              <Text style={styles.label}>Product Category</Text>
              <Text style={styles.label}>Brand</Text>
            </View>
            <View style={styles.rowSpacespace}>
              <Dropdown
                style={styles.dropdown}
                data={categoryOptions.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder=""
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                value={selectedCategory}
                onFocus={onHandleCategory}
                onChange={item => setSelectedCategory(item.value)}
                search
              />
              <Dropdown
                style={styles.dropdown}
                data={brandOptions.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                labelField="label"
                valueField="value"
                placeholder=""
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                value={selectedBrand}
                onFocus={onHandleBrand}
                onChange={item => setSelectedBrand(item.value)}
                search
              />
            </View>
            <Text style={styles.label}>Item Detail</Text>
            <Dropdown
              style={styles.dropdownitem}
              data={ProductOptions.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              labelField="label"
              valueField="value"
              placeholder=""
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemTextStyle={styles.itemTextStyle}
              value={itemDetail}
              onFocus={() => { if (selectedCategory && selectedBrand) onHandleProduct(); }}
              onChange={item => setItemDetail(item.value)}
              search
            />
            <View style={[styles.rowSpace, { marginTop: 6 }]}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.label}>Thickness</Text>
            </View>
            <View style={styles.rowSpacespace}>
              <Dropdown
                style={styles.dropdown}
                data={typeOptions}
                labelField="label"
                valueField="value"
                placeholder=""
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                value={selectedType}
                onChange={item => setSelectedType(item.value)}
                search={false}
              />

              <TextInput
                style={[styles.inputSmall, { backgroundColor: '#f2f2f2' }]}
                editable={false}
         value={selectedThickness?.name || ''} />
            </View>
            <View style={styles.rowSpace}>
              <Text style={styles.label}>Nos</Text>
              <Text style={styles.label}>Width</Text>
            </View>
            <View style={styles.rowSpacespace}>
              <TextInput
                style={styles.inputSmall}
                placeholder=""
                value={nos}
                onChangeText={setNos}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.inputSmall, { backgroundColor: '#f2f2f2' }]}
                editable={false}
                value={selectedWidth?.name || ''} />
            </View>
            <View style={styles.rowSpace}>
              <Text style={styles.label}>Quantity</Text>
              <Text style={styles.label}>Length</Text>
            </View>
            <View style={styles.rowSpacespace}>
              <TextInput
                style={[styles.inputSmall, { fontSize: 14 }]}
                placeholder=""
                placeholderTextColor="#2f1785ff"
                value={quantity}
                editable={selectedType === 'mts'}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.inputSmall, { backgroundColor: '#f2f2f2' }]}
                editable={false}
              value={selectedLength?.name || ''} />
            </View>
            <View style={styles.rowSpace}>
              <Text style={styles.label}>Ask Price</Text>
              <Text style={[styles.label, { fontSize: 13, fontWeight: '600', color: '#020e94ff' }]}>
                Bisco Price:{" "}
                <Text style={{ color: '#020e94ff' }}>
                  ₹ {biscoPrice || '0.00'}
                </Text>
              </Text>
            </View>
            <View style={styles.rowSpaceprice}>
              <TextInput
                style={styles.inputSmall}
                placeholder=""
                value={askPrice}
                onChangeText={setAskPrice}
                keyboardType="numeric"
              />
              <Text style={[styles.label, { fontSize: 13, fontWeight: '600', color: 'green' }]}>
                Difference:{" "}
                <Text style={{ color: difference >= 0 ? 'green' : 'green' }}>
                  ₹ {difference || '0.00'}
                </Text>
              </Text>
            </View>
            <View style={styles.rowSpace}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={handleClose}>
                <Text style={[styles.buttonText, { color: '#000' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddItemModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowSpacespace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  rowSpaceprice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  dropdown: {
    height: 40,
    width: '48%',
    height: 35,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,

  },
  dropdownitem: {
    height: 40,
    width: '100%',
    height: 35,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#999',
  },

  selectedTextStyle: {
    fontSize: 13,
    color: '#020e94ff',
    fontWeight: '500',
  },

  itemTextStyle: {
    fontSize: 13,
    color: '#000',
  },
  label: {
    fontSize: 11,
    color: '#777777ff',
  },
  labelbisco: {
    fontSize: 11,
    color: '#777777ff',
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 0,
    width: '48%',
    height: 35,
    fontSize: 13,
    color: '#020e94ff',
    textAlignVertical: 'center',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#020e94ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stockButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#020e94ff',
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockButtonActive: {
    backgroundColor: '#020e94ff',
  },
  stockButtonText: {
    color: '#020e94ff',
    fontWeight: 'bold',
  },
});
