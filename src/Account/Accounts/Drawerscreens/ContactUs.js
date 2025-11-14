import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const backgroundImage = require('../../../assets/backgroundimg.png');

  const handleSubmit = () => {
    Alert.alert('Message Sent', `Thank you ${name}, we will contact you soon!`);
    setName('');
    setEmail('');
    setMobile('');
    setMessage('');
  };

  // Separate expanded state for each row
  const [expandedFirstRow, setExpandedFirstRow] = useState(null);
  const [expandedSecondRow, setExpandedSecondRow] = useState(null);

  const branches = [
    { name: 'Tirupur', details: ['🏢 S.F.No 349/3, Thanneer Panthal Colony, 15-Velampalayam Village, Anupparpalayam, Tirupur – 641 652.', 'Branch Manager: Arokiyasamy.T', '📧 baluirontirupur@gmail.com', '📞 +91 709 400 4500', '📞 +91 709 400 4500'] },
    { name: 'pondicherry', details: ['🏢 No : 48/1A, Mayilam Pondi Road, Vandoor Taluk, Villupuram – 641 001.', 'Branch Manager: Aravindh Kannan', '📧 pondybisco@gmail.com', '📞 +91 73737 96003'] },
    { name: 'Chennai', details: ['🏢 Spring Heaven Old, No : 8, New No : 27, Flatno 2, A. R. K. Colony, Eldams Road, Teynampet, Chennai – 600 018.', 'Branch Manager: Saravanan.S.M', '📧 baluironchennai@gmail.com', '📞 +91 94425 19136', '📞 044 – 42037000'] },
    { name: 'Trichy', details: ['🏢 301 /3 Chennai By Pass Road, Senthaneerpuram, Trichy – 620 004.', 'Branch Manager: Ilangeshwaran.S', '📧 info_riscotrichy@yahoo.com', '📞 +91 73737 110 76'] },
    { name: 'Madurai', details: ['🏢 No : 4/100, Trichy Main Road, Uthangudi, Madurai – 625 107.', 'Branch Manager: Ramanathan.M', '📧 msrsteelmdu@gmail.com', '📞 +91 750 26 11 322'] },
    { name: 'cochin', details: ['🏢 IV / 467, Palackkal Building, Opp Appolo Tyre Junction, Above PNB, North Kalamachery Post, Ernakulam – 683 104.', 'Branch Manager: Dijidass.M.K', '📧 riscokl@yahoo.com', '📞 +91 94465 07144', '📞 0484 – 2555144', '📞 0484 – 2555145'] },
  ];

  // Function to render a row of branches with details below
  const renderBranchRow = (branchArray, expandedRowState, setExpandedRowState) => (
    <View>
      <View style={styles.row}>
        {branchArray.map((branch, index) => (
          <TouchableOpacity
            key={index}
            style={styles.branchCard}
            onPress={() =>
              setExpandedRowState(expandedRowState === index ? null : index)
            }
          >
            <Text style={styles.branchName}>{branch.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {expandedRowState !== null && (
        <View style={styles.detailsContainer}>
          {branchArray[expandedRowState].details.map((detail, i) => {
            const isEmail = detail.startsWith('📧');
            const isPhone = detail.startsWith('📞');
            return (
              <Text key={i} style={[styles.branchDetail, isEmail && styles.email, isPhone && styles.phone]}>
                {detail}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Contact Us</Text>
        <Text style={styles.subHeading}>We’re here to help</Text>
        <Text style={styles.text1}>We’re here to help and answer any question you might have. We look forward to hearing from you.</Text>

        {/* Contact Form */}
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#555" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#555" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Mobile" placeholderTextColor="#555" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
          <TextInput style={[styles.input, { height: 100 }]} placeholder="Message" placeholderTextColor="#555" multiline value={message} onChangeText={setMessage} />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}><Text style={styles.buttonText}>Send Message</Text></TouchableOpacity>
        </View>

        {/* Corporate Office Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoHeading}>CORPORATE OFFICE</Text>
          <Text style={styles.text}>🏢 No 234 & 235,</Text>
          <Text style={styles.text}>East TV Swamy Road,</Text>
          <Text style={styles.text}>R S Puram, Coimbatore – 641 002.</Text>
          <Text style={styles.text}>📧 info@biscosteels.com</Text>
          <Text style={styles.text}>☎️ 0422 – 4504500</Text>
          <Text style={styles.text}>📞 +91 915 960 6000</Text>
        </View>

        {/* Warehouse & Transport Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoHeading}>WAREHOUSE & TRANSPORT</Text>
          <Text style={styles.text}>Sri Venkatramana Transports</Text>
          <Text style={styles.text}>🏢 SF. NO : 504 / A,</Text>
          <Text style={styles.text}>Keeranatham Village, Saravanam Patti Post,</Text>
          <Text style={styles.text}>Coimbatore – 641 035.</Text>
          <Text style={styles.text}>📞 96884 18000  / 98652 18000</Text>
        </View>

        <Text style={styles.heading1}>Branch Offices</Text>
        {renderBranchRow(branches.slice(0, 3), expandedFirstRow, setExpandedFirstRow)}
        {renderBranchRow(branches.slice(3, 6), expandedSecondRow, setExpandedSecondRow)}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 ,marginTop:"10%"},
  heading1: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  subHeading: { fontSize: 20, fontWeight: '600', color: '#edededff', textAlign: 'center', marginBottom: 5 },
  text1: { fontSize: 15, lineHeight: 22, color: '#e1e1e1ff', marginBottom: 5, textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, color: '#545454ff', marginBottom: 5, textAlign: 'center' },
  form: { marginTop: 20, marginBottom: 30, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff', color: '#000' },
  button: { backgroundColor: '#c0392b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  branchCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 12, marginHorizontal: 5, alignItems: 'center' },
  branchName: { fontSize:12, fontWeight: '500', color: '#c0392b' },
  detailsContainer: { marginVertical: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, alignItems: 'center' },
  branchDetail: { fontSize: 15, color: '#ecececff', marginBottom: 5, textAlign: 'center' },
  phone: { color: '#ecececff', },
  email: { color: '#dfdfdfff',  },
  infoSection: { marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 15 },
  infoHeading: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 8, textAlign: 'center' },
});

export default ContactUs;
