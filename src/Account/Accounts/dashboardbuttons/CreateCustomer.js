import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, ScrollView, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit } from '../../../redux/action';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Animatable from 'react-native-animatable';

const CreateCustomer = () => {
    const [name, setName] = useState('');
    const [pan, setPan] = useState('');
    const [mobile, setMobile] = useState('');
    const [segment, setSegment] = useState(null);
    const [gst, setGst] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [pincode, setPincode] = useState('');
    const [stateName, setStateName] = useState('');
    const [city, setCity] = useState('');

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const postcreatevisitData = useSelector(state => state.postcreatevisitReducer.data);
    const segmentList = useSelector(state => state.postcreatevisitReducer.data.segmentList || []);
    const stateList = useSelector(state => state.postcreatevisitReducer.data.stateList || []);
    const createCustomerResult = useSelector(state => state.postcreatevisitReducer.data.CreateCustomer);
    const createCustomerError = useSelector(state => state.postcreatevisitReducer.error.CreateCustomer);



    const items = {
        segment_model: "res.partner.industry",
        segment_method: "search_read",
        segment_args: [],
        segment_fields: ["id", "name"],

        state_model: "res.country.state",
        state_method: "search_read",
        state_args: [],
        state_fields: ["id", "name"],
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

    const handleSubmit = async () => {
        const missingFields = [];
        if (!name) missingFields.push("Customer Name");
        if (!mobile) missingFields.push("Mobile Number");
        if (!segment) missingFields.push("Customer Segment");
        if (!stateName) missingFields.push("State");
        if (!address) missingFields.push("Address");
        if (!pincode) missingFields.push("Pincode");
        if (!city) missingFields.push("City");

        if (missingFields.length > 0) {
            alert(`Please fill the following fields:\n- ${missingFields.join("\n- ")}`);
            return;
        }

        const payload = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "res.partner",
                method: "create",
                args: [
                    {
                        ...(name && { name }),
                        ...(mobile && { mobile }),
                        ...(gst && { vat: gst }),
                        ...(pan && { l10n_in_pan: pan }),
                        ...(email && { email }),
                        ...(address && { street: address }),
                        ...(pincode && { zip: pincode }),
                        ...(city && { city }),
                        ...(segment && { industry_id: segment }),
                        ...(stateName && { state_id: stateName }),
                    },
                ],
                kwargs: {},
            },
        };
        try {
            const response = await dispatch(postcreatevisit(payload, "CreateCustomer"));
            if (response?.data?.result) {
                alert("Customer created successfully!");
                navigation.navigate("OpenEnquiry");
            } else {
                alert("Customer created successfully!");
                navigation.navigate("OpenEnquiry");
            }
        } catch (error) {
            alert("Something went wrong. Please try again.");
        }
    };

    const onHandleSegment = () => {
        dispatch(postcreatevisit(dataParams("segment"), "segmentList"));
    };

    const onHandleState = () => {
        dispatch(postcreatevisit(dataParams("state"), "stateList"))
    };

    return (
        <ImageBackground
            source={require('../../../assets/backgroundimg.png')}
            style={{ flex: 1, resizeMode: 'cover', padding: 20 }}>
            <View >
                <Text style={styles.title}>Create Customer</Text>
                <View >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Customer Name</Text>
                    </View>
                    <Animatable.View animation="fadeInUp" duration={1000} delay={100}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                style={styles.inputBoxcustomerfield}
                                placeholder="Customer Name"
                                placeholderTextColor="#c6c4c4"
                                value={name}
                                onChangeText={setName} />
                        </View>
                    </Animatable.View>
                </View>
                <View >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Gst Number</Text>
                    </View>
                    <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                style={styles.inputBoxcustomerfield}
                                placeholder="Gst Number "
                                placeholderTextColor="#c6c4c4"
                                value={gst}
                                onChangeText={setGst} />
                        </View>
                    </Animatable.View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdowntitle, { textAlign: 'left' }]}>
                            Customer Segment
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdowntitle, { textAlign: 'left', marginLeft: "4%" }]}>
                            Pan Number
                        </Text>
                    </View>
                </View>
                <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Dropdown
                            style={[styles.dropdownmain]}
                            data={(segmentList || []).map(i => ({ label: i.name, value: i.id }))}
                            labelField="label"
                            valueField="value"
                            placeholder="Segment"
                            placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
                            itemTextStyle={{ fontSize: 12 }}
                            selectedTextStyle={{ fontSize: 14 }}
                            search
                            searchPlaceholder="Search "
                            value={segment}
                            onFocus={onHandleSegment}
                            onChange={item => setSegment(item.value)}
                        />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Pan Number"
                            placeholderTextColor="#c6c4c4"
                            value={pan}
                            onChangeText={setPan}
                            maxLength={16} />
                    </View>
                </Animatable.View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdowntitle, { textAlign: 'left' }]}>
                            Mobile No
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdowntitle, { textAlign: 'left', marginLeft: "4%" }]}>
                            Email
                        </Text>
                    </View>
                </View>
                <Animatable.View animation="fadeInUp" duration={1000} delay={700}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Mobile No"
                            placeholderTextColor="#c6c4c4"
                            value={mobile}
                            keyboardType="number-pad"
                            onChangeText={setMobile}
                            maxLength={10} />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Email"
                            placeholderTextColor="#c6c4c4"
                            value={email}
                            onChangeText={setEmail} />
                    </View>
                </Animatable.View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '48%' }}>
                        <Text style={styles.dropdowntitle}>Address</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={900}>
                            <View>
                                <TextInput
                                    style={styles.inputBoxMulti}
                                    placeholder="Address"
                                    placeholderTextColor="#c6c4c4"
                                    multiline={true}
                                    numberOfLines={6}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>
                        </Animatable.View>
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={styles.dropdowntitle}>Pincode</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>
                            <View>
                                <TextInput
                                    style={styles.inputBox3}
                                    placeholder="Pincode"
                                    placeholderTextColor="#c6c4c4"
                                    value={pincode}
                                    onChangeText={setPincode}
                                    maxLength={12}
                                />
                            </View>
                        </Animatable.View>
                        <Text style={[styles.dropdowntitle, { marginTop: 10 }]}>State</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1500}>
                            <View>
                                <Dropdown
                                    style={[styles.dropdown]}
                                    data={(stateList || []).map(i => ({ label: i.name, value: i.id }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select State"
                                    placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
                                    itemTextStyle={{ fontSize: 12 }}
                                    selectedTextStyle={{ fontSize: 14 }}
                                    search
                                    searchPlaceholder="Search State"
                                    value={stateName}
                                    onFocus={() => {
                                        console.log("State dropdown opened");
                                        dispatch(postcreatevisit(dataParams("state"), "stateList"));
                                    }}
                                    onChange={item => {
                                        console.log("State selected:", item);
                                        setStateName(item.value);
                                    }}
                                />
                            </View>
                        </Animatable.View>
                        <Text style={[styles.dropdowntitle, { marginTop: 10 }]}>City</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1800}>
                            <View>
                                <TextInput
                                    style={styles.inputBox3}
                                    placeholder="City"
                                    placeholderTextColor="#c6c4c4"
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>
                        </Animatable.View>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};
export default CreateCustomer;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        color: '#b816b5ff',
        marginTop: '20%',
        fontWeight: 'bold',
        textAlign: "center",
        marginBottom: '10%'
    },
    dropdowntitle: {
        fontSize: 11.5,
        color: '#fffefeff',
        marginTop: '2%',
        fontWeight: 'bold',
    },
    dropdowntitle1: {
        fontSize: 11.5,
        color: '#dcdadaff',
        fontWeight: 'bold',
    },
    dropdownmain: {
        height: 40,
        width: '50%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%',
    },
    dropdown: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%'
    },
    dropdown1: {
        height: 40,
        width: '48%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%'
    },
    dateButton: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        width: '43%',
        height: 40,
        marginBottom: '2%'
    },
    dateText: {
        fontSize: 11.5,
        color: '#333',
    },
    inputBox: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '48%',
        marginBottom: '2%'
    },
    inputBoxcustomerfield: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '100%',
        marginBottom: '2%'
    },
    inputBox1: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        width: '100%',
        height: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#020e94ff',
        width: '50%',
        height: 40,
        borderRadius: 15,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: '20%',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputBoxMulti: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        height: 180,
        textAlignVertical: 'top',
        marginBottom: '2%',
    },
    inputBox3: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '100%',
        marginBottom: '2%'
    }
});
