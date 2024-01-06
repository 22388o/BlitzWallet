import {useEffect, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import {COLORS, FONT, ICONS, SIZES} from '../../constants';
import {
  AboutPage,
  DisplayOptions,
  DrainPage,
  FiatCurrencyPage,
  InfoPopup,
  LSPPage,
  NodeInfo,
  RecoveryPage,
  ResetPage,
} from '../../components/admin/homeComponents/settingsContent';

import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../../context-store/context';
import FaceIdPage from '../../components/admin/homeComponents/settingsContent/faceId';

export default function SettingsContentIndex(props) {
  const [displayPopup, setDisplayPopup] = useState({
    isDisplayed: false,
    type: '',
    variable: null,
  });
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const navigate = useNavigation();
  const {theme, toggleTheme} = useTheme();
  const selectedPage = props.route.params.for;

  return (
    <View
      style={[
        styles.globalContainer,
        {
          backgroundColor: theme
            ? COLORS.darkModeBackground
            : COLORS.lightModeBackground,
        },
      ]}>
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.topbar}>
          <TouchableOpacity
            onPress={() => {
              navigate.goBack();
            }}>
            <Image style={styles.topBarIcon} source={ICONS.leftCheveronIcon} />
          </TouchableOpacity>
          <Text
            style={[
              styles.topBarText,
              {
                color: theme ? COLORS.darkModeText : COLORS.lightModeText,
              },
            ]}>
            {selectedPage}
          </Text>
        </View>

        {/* <View style={{flex: 1}}> */}
        {selectedPage?.toLowerCase() === 'about' && <AboutPage theme={theme} />}

        {selectedPage?.toLowerCase() === 'fiat currency' && (
          <FiatCurrencyPage
            theme={theme}
            setSettingsContent={props.setSettingsContent}
          />
        )}
        {selectedPage?.toLowerCase() === 'node info' && (
          <NodeInfo theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'display options' && (
          <DisplayOptions theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'face id' && (
          <FaceIdPage theme={theme} />
        )}

        {selectedPage?.toLowerCase() === 'recovery phrase' && (
          <RecoveryPage
            theme={theme}
            setSettingsContent={props.setSettingsContent}
          />
        )}
        {selectedPage?.toLowerCase() === 'lsp' && (
          <LSPPage theme={theme} setDisplayPopup={setDisplayPopup} />
        )}
        {selectedPage?.toLowerCase() === 'reset wallet' && (
          <ResetPage theme={theme} />
        )}
        {selectedPage?.toLowerCase() === 'drain wallet' && (
          <DrainPage
            setBitcoinAddress={setBitcoinAddress}
            bitcoinAddress={bitcoinAddress}
            setDisplayPopup={setDisplayPopup}
            theme={theme}
          />
        )}
        {/* </View> */}
      </SafeAreaView>
      <InfoPopup
        setDisplayPopup={setDisplayPopup}
        {...displayPopup}
        setBitcoinAddress={setBitcoinAddress}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: COLORS.background,
    zIndex: 2,
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarIcon: {
    width: 25,
    height: 25,
  },
  topBarText: {
    fontSize: SIZES.large,
    marginRight: 'auto',
    marginLeft: 'auto',
    transform: [{translateX: -12.5}],
    fontFamily: FONT.Title_Bold,
  },
});