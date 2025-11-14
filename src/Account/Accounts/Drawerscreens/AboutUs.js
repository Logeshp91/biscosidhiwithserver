import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ImageBackground } from 'react-native';

const AboutUs = () => {
  const profilePic = require('../../../assets/md.jpg');
  const backgroundImage = require('../../../assets/backgroundimg.png');

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        {/* Heading */}
        <Text style={styles.heading}>About BISCO</Text>

        {/* Fixed Card Section */}
        <View style={styles.card}>
          <Image source={profilePic} style={styles.image} />
          <Text style={styles.subHeadingCenter}>Shri A. K. Balasubramanian</Text>
          <Text style={styles.textCenter}>Chairman of Balu Group of Companies</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.text}>
            🔶 Founded by Business Visionary Shri A. K. Balasubramanian, Chairman of Balu Group of Companies,
            who was instrumental in growing the business exponentially through sheer commitment and belief
            in Quality, Service, and Value.
          </Text>

          <Text style={styles.text}>
            🔶 Balu Iron and Steel Company along with Balu Cement Corp are the fastest-growing divisions among
            the BISCO group of companies, having a group turnover of ₹1350 crore.
          </Text>

          <Text style={styles.text}>
            🔶 BISCO / BCC are the largest Distributor, Stockist, and Supplier of JSW Steel, dealing with their
            leading brands like
            <Text style={styles.highlight}> JSW Neosteel</Text>,
            <Text style={styles.highlight}> JSW Coloron+</Text>, and
            <Text style={styles.highlight}> JSW True Steel</Text>.
            {'\n\n'}
            🔶 The product range encompasses all types of steel products —
            <Text style={styles.highlight}> TMT</Text>,
            <Text style={styles.highlight}> HR</Text>,
            <Text style={styles.highlight}> CHEQUERED</Text>,
            <Text style={styles.highlight}> CR</Text>,
            <Text style={styles.highlight}> HRPO</Text>,
            <Text style={styles.highlight}> GP</Text>,
            <Text style={styles.highlight}> COLOR COATED</Text>,
            <Text style={styles.highlight}> ROOFING SHEETS</Text>,
            <Text style={styles.highlight}> GL & GC</Text>,
            <Text style={styles.highlight}> ANGLES</Text>,
            <Text style={styles.highlight}> CHANNELS</Text>,
            <Text style={styles.highlight}> JOIST</Text>,
            <Text style={styles.highlight}> BEAMS</Text>,
            <Text style={styles.highlight}> WIRE RODS</Text>, etc.
          </Text>

          <Text style={styles.subHeading}>Why Choose BISCO?</Text>
          <Text style={styles.text}>✅ Extensive range of steel products, brands, and services under one roof.</Text>
          <Text style={styles.text}>✅ Largest 25-acre service facility for Decoiling, Cutting, and Customized Products.</Text>
          <Text style={styles.text}>✅ Four decades of presence in the steel industry.</Text>
          <Text style={styles.text}>✅ In-house logistics support ensuring timely delivery.</Text>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 50 },

  scrollContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 12,
  },

  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#f1e3e2ff',
    textAlign: 'center',
    marginBottom: 20,
  },

  subHeading: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginTop: 15 },
  subHeadingCenter: { fontSize: 18, fontWeight: '700', color: '#2c3e50', textAlign: 'center' },

  text: { fontSize: 15, lineHeight: 22, color: '#dfdfdfff', marginTop: 8, paddingHorizontal: 10 },
  textCenter: { fontSize: 15, color: '#555', textAlign: 'center' },

  highlight: { color: '#ffffffff', fontWeight: '600' },
});

export default AboutUs;
