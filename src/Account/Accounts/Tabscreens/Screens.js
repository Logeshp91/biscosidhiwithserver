import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView, ImageBackground, ToastAndroid,
  LayoutAnimation,
  UIManager, Platform, BackHandler, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postcreatevisit } from '../../../redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, LineChart } from 'react-native-chart-kit';
import BarChartSolid from './BarChartSolid';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Screens = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const [selectedTab, setSelectedTab] = useState(null);
const chartWidth = wp('45%');
const chartHeight = hp('18%'); 

  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [totalListCount, setTotalListCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [OutstandingCount, setOutstandingCount] = useState(0);
  const [ApprovedListCount, setApprovedListCount] = useState(0);
  const [lostlistCount, setLostlistCount] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [CollectionValue, setCollectionValue] = useState(0);
  const [showThirdChart, setShowThirdChart] = useState(false);

  const [enquiries, setEnquiries] = useState([]);
const [offset, setOffset] = useState(0);
const limit = 10;
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

  const collectionAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;


  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryListdata"] || []
  );
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryListdata"]
  );
  const { postauthendicationData } = useSelector(state => state.postauthendicationReducer);
  const user = postauthendicationData || {};

  const now = new Date();
  const hours = now.getHours();

  // Dynamic greeting based on time
  let greetingText = '';
  if (hours < 12) {
    greetingText = 'Good Morning';
  } else if (hours < 17) {
    greetingText = 'Good Afternoon';
  } else {
    greetingText = 'Good Evening';
  }

  // Format today's date (e.g., Tuesday, Sep 2)
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const StatBox = ({ label, color, onPress, labelStyle }) => (
    <TouchableOpacity style={[styles.colorBox, { backgroundColor: color }]} onPress={onPress}>
      <Text style={[styles.boxText, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  const backPressRef = useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // Check if we are on root screen
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        const isRootScreen = currentRoute.name === 'Screens'; // root check

        if (!isRootScreen) {
          navigation.goBack();
          return true;
        }

        const timeNow = Date.now();
        if (backPressRef.current && timeNow - backPressRef.current < 2000) {
          BackHandler.exitApp(); // exit app on second press
          return true;
        }

        backPressRef.current = timeNow;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Collection Animation
  //     collectionAnim.setValue(0); // reset
  //     const collectionListener = collectionAnim.addListener(({ value }) => {
  //       setCollectionValue(Math.round(value));
  //     });

  //     Animated.timing(collectionAnim, {
  //       toValue: 80,
  //       duration: 1500,
  //       useNativeDriver: false,
  //     }).start();

  //     // Progress Animation
  //     progressAnim.setValue(0); // reset
  //     const progressListener = progressAnim.addListener(({ value }) => {
  //       setProgressValue(Math.round(value));
  //     });

  //     Animated.timing(progressAnim, {
  //       toValue: 52,
  //       duration: 1500,
  //       useNativeDriver: false,
  //     }).start();

  //     return () => {
  //       collectionAnim.removeListener(collectionListener);
  //       progressAnim.removeListener(progressListener);
  //     };
  //   }, [])
  // );
  
  useFocusEffect(
    React.useCallback(() => {
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "customer.visit",
          method: "search_read",
          args: [],
          kwargs: {
            fields: [
              "id",
              "state",
              "followup_date",
              "name",
              "partner_id",
              "brand",
              "visit_purpose",
              "product_category",
              "required_qty",
              "remarks",
              "so_id",
              "outcome_visit",
              "create_date",
              "billing_branch_id"
            ],
               order: "id desc",
          },
        },
      };

      dispatch(postcreatevisit(payload, "openEnquiryListdata"));
    }, [dispatch])
  );
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
useEffect(() => {
  if (Array.isArray(postcreatevisitData)) {
    const today = new Date().toISOString().split('T')[0];
    const todaysFollowups = postcreatevisitData.filter(item => 
      item.followup_date && new Date(item.followup_date).toISOString().split('T')[0] === today
    );

    // Compare previous IDs to avoid unnecessary state update
    const prevIds = todayFollowUps.map(i => i.id).join(',');
    const newIds = todaysFollowups.map(i => i.id).join(',');

    if (prevIds !== newIds) {
      setTodayFollowUps(todaysFollowups);
    }
  }
}, [postcreatevisitData]);

  
  if (postcreatevisitLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleHorizontalScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    if (scrollX > 150) {
      setShowThirdChart(true);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/backgroundimg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={styles.container}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}
          >
            <View style={{ flexDirection: "row" ,}}>
              <ImageBackground
                source={require('../../../assets/Rectangle.png')}
                style={styles.circleBackground1}
              >
                <View style={{ alignItems: 'flex-start', padding: 10 }}>
                  <Text style={styles.targetTextTitle}>Sales Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetTextValue}>100 {" "}</Text>
                    <Text style={styles.targetTextValue}>MT</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetText}>Achieved</Text>
                    <Text style={styles.targetText1}>{" "}82</Text>
                    <Text style={styles.targetText2}>{" "}MT</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                    {/* <CircularProgress
                      value={CollectionValue}
                      maxValue={100}
                      radius={30}
                      activeStrokeWidth={12}
                      inActiveStrokeWidth={12}
                      activeStrokeColor="#57D6E2"
                      inActiveStrokeColor="#9c9c9cff"
                      inActiveStrokeOpacity={0.3}
                      duration={1200}
                      progressValueColor="#11033B"
                      progressValueStyle={{ fontFamily: 'Inter-Bold', fontSize: 20 }}
                      valueSuffix="%"
                      renderCap={() => <Text style={{ display: 'none' }} />}
                      innerCircleColor="#FFFFFF"
                    /> */}
                  </View>
                </View>
              </ImageBackground>
              <ImageBackground
                source={require('../../../assets/Rectangle2.png')}
                style={styles.circleBackground2}
                resizeMode="cover"
              >
                <View style={{ alignItems: 'flex-start', marginLeft: 5, marginTop: 7 }}>
                  <Text style={styles.targetTextTitle}>Collection Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetTextValue}>₹</Text>
                    <Text style={styles.targetTextValue}>50,00,000</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 10 }}>
                    <Text style={styles.targetText}>Collected{" "}</Text>
                    <Text style={styles.targetText1}>₹{" "}</Text>
                    <Text style={styles.targetText2}>28,00,000</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                    {/* <CircularProgress
                      value={progressValue}
                      maxValue={100}
                      radius={30}
                      activeStrokeWidth={12}
                      inActiveStrokeWidth={12}
                      activeStrokeColor="#57D6E2"
                      inActiveStrokeColor="#9c9c9cff"
                      inActiveStrokeOpacity={0.3}
                      duration={1200}
                      progressValueColor="#11033B"
                      progressValueStyle={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 20,
                      }}
                      renderCap={() => <Text style={{ display: 'none' }} />}
                      valueSuffix="%"
                    /> */}
                  </View>
                </View>
              </ImageBackground>

              <ImageBackground
                source={require('../../../assets/Rectangle3.png')}
                style={styles.circleBackground3}
                resizeMode="cover"
              >
                <View style={{ alignItems: 'flex-start', marginLeft: 10, marginTop: 7 }}>
                  <Text style={styles.targetTextTitleVisit}>Visit</Text>
                  <View style={{ flexDirection: "row", marginBottom: 5, }}>
                    <Text style={styles.targetText}>Planned </Text>
                    <Text style={styles.targetText1}>20</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 15, }}>
                    <Text style={styles.targetText}>completed </Text>
                    <Text style={styles.targetText1}>20</Text>
                  </View>
                </View>
                <View style={{
                  width: '80%',
                  marginTop: 10,
                  marginLeft: 10,
                  marginBottom: 10
                }}>
                  <View style={{
                    height: 8,
                    width: '90%',
                    backgroundColor: '#D9D9D9',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: '40%',
                      backgroundColor: '#57D6E2',
                    }} />
                  </View>
                </View>

                <View style={{ flexDirection: "row", marginLeft: 6 }}>
                  <Text style={styles.targetTextValue}>₹</Text>
                  <Text style={styles.targetTextValue}>1,00,000</Text>
                </View>
              </ImageBackground>
            </View>


            <View>
<TouchableOpacity
  onPress={() => navigation.navigate('ProductList')}
  style={{
    width: wp('30%'),         
    height: hp('20%'),         
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#250588', 
    borderRadius: hp('1%'),  
    marginLeft: wp('2%'),
    marginTop: hp('1%'),
    elevation: 5, 
  }}
>
  <Text style={{
    color: '#ffffff', 
    fontSize: hp('2%'), 
    fontWeight: '600',
    textAlign: 'center'
  }}>
    Product List
  </Text>
</TouchableOpacity>

            </View>
          </ScrollView>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.Visitcroll}
              contentContainerStyle={{
                flexDirection: 'row',
              }}
            >

              <View >
                <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/allList.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity onPress={() => navigation.navigate('OpenEnquiry')}>
        <Text style={styles.cardLabel}>Visit</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                <View style={{ marginTop: 10 }}>
                   <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/pendingicon.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity onPress={() => navigation.navigate('Deliveries')}>
        <Text style={styles.cardLabel}>Deliveries</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                </View>
              </View>
              <View style={{}}>
                 <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/Approvedicon.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity onPress={() => navigation.navigate('ApprovedList')}>
        <Text style={styles.cardLabel}>Approved</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                <View style={{ marginTop: 10 }}>
                    <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/completed.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity onPress={() => navigation.navigate('Outstanding')}>
        <Text style={styles.cardLabel}>Outstanding</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                </View>
              </View>
              <View >
                <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/completed.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity >
        <Text style={styles.cardLabel}>Empty</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                <View style={{ marginTop: 10 }}>
                   <ImageBackground
    source={require('../../../assets/Rectanglelist.png')}
    style={styles.cardBackground}
    imageStyle={styles.cardImage}
  >
    <View style={styles.cardContent}>
      <Image source={require('../../../assets/saleorder.png')} style={styles.cardIcon} resizeMode="contain" />
      <TouchableOpacity>
        <Text style={styles.cardLabel}>Empty</Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
                </View>
              </View>
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ flexDirection: 'row', }}
            >
              <View>
                <View style={{ flexDirection: 'row', marginTop: 20, backgroundColor: 'transparent' }}>
               <ImageBackground
  source={require('../../../assets/Chartbg.png')}
  style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
  imageStyle={{ borderRadius: hp('1%') }}
>
  <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Sales</Text>
  <BarChartSolid
    data={[30, 45, 28, 80, 99, 43, 50]}
    height={chartHeight * 0.5}
    color="#0C439E"
  />
  <Text style={[styles.ChartText2, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>80 MT</Text>
</ImageBackground>             
                 <ImageBackground
  source={require('../../../assets/Chartbg.png')}
  style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
  imageStyle={{ borderRadius: hp('1%') }}
>
  <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Collections</Text>
   <LineChart
                      transparent={true}
                      data={{
                        labels: [],
                        datasets: [{ data: [20, 40, 35, 60, 55, 40, 70, 60, 50] }],
                      }}
                      width={chartWidth * 0.9}
    height={chartHeight * 0.5}
                      fromZero
                      withDots={false}
                      withShadow={false}
                      withInnerLines={false}
                      withHorizontalLabels={false}
                      withVerticalLabels={false}
                      chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: 'transparent',
                        backgroundGradientTo: 'transparent',
                        fillShadowGradient: 'transparent',
                        fillShadowGradientOpacity: 0,
                        color: () => '#0C439E',
                        strokeWidth: 2,
                        propsForBackgroundLines: {
                          stroke: 'transparent',
                        },
                        propsForLabels: {
                          fill: 'transparent',
                        },
                      }}
                      bezier
                      style={{
                        backgroundColor: 'transparent',
                        transform: [{ translateX: -30 }],
                      }}
                    />
                    <Text style={[styles.ChartText2, { marginRight: '40%' }]}>₹ 1,00,000</Text>
                  </ImageBackground>

                 <ImageBackground
  source={require('../../../assets/Chartbg.png')}
  style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
  imageStyle={{ borderRadius: hp('1%') }}
>
  <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Sales</Text>
  <BarChartSolid
    data={[30, 45, 28, 80, 99, 43, 50]}
    height={chartHeight * 0.5}
    color="#0C439E"
  />
  <Text style={[styles.ChartText2, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>80 MT</Text>
</ImageBackground>
                </View>
              </View>
            </ScrollView>
          </Animated.ScrollView>
        </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}

export default Screens;
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    marginTop: wp('5%'),
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('3%'),
    color: '#DDDFE6',
    fontWeight: 'bold',
    marginLeft: wp('3%'),
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('3%'),
    color: '#DDDFE6',
    marginTop: hp('0.5%'),
    marginLeft: wp('3%'),
  },

  // 🔹 Circle Backgrounds (Sales / Collection / Visit)
  circleBackground1: {
    width: wp('30%'),
    height: hp('22%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: wp('3%'),
    marginTop: hp('1%'),
  },
  circleBackground2: {
    width: wp('34%'),
    height: hp('22%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: wp('2%'),
    marginTop: hp('1%'),
  },
  circleBackground3: {
    width: wp('27%'),
    height: hp('22%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: wp('1.5%'),
    marginTop: hp('1%'),
  },

  targetText: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },
  targetTextTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('1.8%'),
    color: '#f4f4f5ff',
    fontWeight: 'bold',
    marginLeft: wp('0.5%'),
  },
  targetTextTitleVisit: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('1.8%'),
    color: '#f4f4f5ff',
    fontWeight: 'bold',
    marginLeft: wp('0.5%'),
    marginBottom: hp('0.8%'),
  },
  targetTextValue: {
    fontFamily: 'Inter-Medium',
    fontSize: hp('2.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
    fontWeight: '500',
  },
  targetText1: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },
  targetText2: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },

  ChartText1: {
    fontFamily: 'Inter-SemiBold',
    fontSize: hp('2%'),
    color: '#ffffff',
    marginTop: hp('0.3%'),
    fontWeight: '600',
  },
  ChartText2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: hp('2.3%'),
    color: '#fff9f9',
    fontWeight: 'bold',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp('1%'),
    marginVertical: hp('1%'),
    marginLeft:hp('1.3%')
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  Visitcroll: {
    marginTop: hp('5%'),
    paddingHorizontal: wp('2%'),
    marginBottom: hp('3%'),
  },

  colorBox: {
    width: wp('18%'),
    height: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
    elevation: 8,
  },
  boxText: {
    color: '#250588',
    fontWeight: 'bold',
    fontSize: hp('1.5%'),
  },
  boxNumber: {
    color: '#250588',
    fontSize: hp('1.4%'),
    fontWeight: 'bold',
  },

  listSection: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  listTitle: {
    fontSize: hp('2.2%'),
    marginBottom: hp('1%'),
    color: '#040404',
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: '#250588',
    padding: hp('1%'),
    elevation: 3,
    marginBottom: hp('1%'),
    borderRadius: hp('0.5%'),
  },
  listName: {
    fontSize: hp('1.6%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  listDetail: {
    fontSize: hp('1.4%'),
    color: '#ffffff',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.5%'),
    alignItems: 'center',
  },

  cardScrollContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
  },
  cardBackground: {
    width: wp('45%'),
    height: hp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  cardImage: {
    borderRadius: hp('1%'),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
  },
  cardIcon: {
    width: wp('10%'),
    height: hp('5%'),
  },
  cardLabel: {
    fontSize: hp('2%'),
    color: '#FFFDFD',
    fontFamily: 'Inter',
    fontWeight: '500',
    marginLeft: wp('2%'),
  },
});
