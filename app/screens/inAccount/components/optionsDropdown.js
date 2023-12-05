import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Share,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  BTN,
  CENTER,
  COLORS,
  FONT,
  ICONS,
  SIZES,
  SHADOWS,
} from '../../../constants';
import {useEffect, useRef, useState} from 'react';
import * as WebBrowser from 'expo-web-browser';

const NAVITEMS = [
  {name: 'Faucet', link: 'URL', icon: ICONS.faucetIcon, inApp: true},
  // {name: 'Drain', link: 'URL', icon: ICONS.Checkcircle, inApp: true},
  {
    name: 'Twitter',
    link: 'https://twitter.com/BlitzWallet1',
    icon: ICONS.twitterIcon,
    inApp: false,
  },
  {
    name: 'Telegram',
    link: 'https://t.me/+-VIAPa9ObHM4YWQx',
    icon: ICONS.telegramIcon,
    inApp: false,
  },
  {
    name: 'View Code',
    link: 'https://github.com/BlakeKaufman/BlitzWallet',
    icon: ICONS.githubIcon,
    inApp: false,
  },
];

export function OptionsDropdown(props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navElements = NAVITEMS.map((item, id) => {
    return (
      <View style={styles.navItem} key={id}>
        <TouchableOpacity
          onPress={() => {
            (async () => {
              if (!item.inApp) {
                try {
                  await WebBrowser.openBrowserAsync(item.link);
                } catch (err) {
                  console.log(err, 'OPENING LINK ERROR');
                }
              } else {
                return;
              }
              props.setNavViews(false);
            })();
          }}
          style={styles.tochableOpacityContainer}>
          <Text style={styles.navItemName}>{item.name}</Text>
          <Image source={item.icon} style={{width: 20, height: 20}} />
        </TouchableOpacity>
      </View>
    );
  });

  useEffect(() => {
    if (props.isDisplayed) {
      fadeIn();
    } else fadeOut();
  }, [props.isDisplayed]);

  function fadeIn() {
    Animated.timing(fadeAnim, {
      toValue: 160,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }
  function fadeOut() {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View style={[styles.globalContainer, {height: fadeAnim}]}>
      <View style={styles.contentContainer}>
        <View style={styles.innerContainer}>{navElements}</View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    // backgroundColor: COLORS.gray,
    width: 200,
    height: 160,
    position: 'absolute',
    top: '80%',
    right: 0,

    alignItems: 'center',
    justifyContent: 'center',

    ...SHADOWS.medium,

    backgroundColor: COLORS.primary,

    borderRadius: 5,
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  innerContainer: {
    width: '100%',
    height: 280,

    position: 'absolute',

    top: 0,
    left: 0,
  },
  navItem: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomColor: COLORS.background,
    borderBottomWidth: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  tochableOpacityContainer: {
    width: '100%',
    height: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navItemName: {
    fontSize: SIZES.medium,
    color: COLORS.background,
  },
});