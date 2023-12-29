import {useEffect, useState} from 'react';
import {getFiatRates} from '../../../../functions/SDK';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  openChannelFee,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import QRCode from 'react-native-qrcode-svg';
import {FONT, SIZES, CENTER, COLORS} from '../../../../constants';

export default function LightningPage(props) {
  const [fiatRate, setFiatRate] = useState(0);
  const [generatingQrCode, setGeneratingQrCode] = useState(true);
  const [errorMessageText, setErrorMessageText] = useState('');

  // const props.isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (props.selectedRecieveOption != 'lightning') {
      setErrorMessageText('');
      setFiatRate('');
      setGeneratingQrCode(true);
      return;
    }

    generateLightningInvoice();

    (async () => {
      try {
        const fiatRates = await getFiatRates();
        const [selectedPrice] = fiatRates.filter(rate => rate.coin === 'USD');
        setFiatRate(selectedPrice.value);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [props.selectedRecieveOption, props.updateQRCode]);
  return (
    <View
      style={{
        display: props.selectedRecieveOption === 'lightning' ? 'flex' : 'none',
      }}>
      <View style={[styles.qrcodeContainer]}>
        {generatingQrCode && (
          <ActivityIndicator
            size="large"
            color={
              props.isDarkMode ? COLORS.darkModeText : COLORS.lightModeText
            }
          />
        )}
        {!generatingQrCode && (
          <QRCode
            size={250}
            value={
              props.generatedAddress
                ? props.generatedAddress
                : 'Thanks for using Blitz!'
            }
            color={
              props.isDarkMode ? COLORS.darkModeText : COLORS.lightModeText
            }
            backgroundColor={
              props.isDarkMode
                ? COLORS.darkModeBackground
                : COLORS.lightModeBackground
            }
          />
        )}
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.valueAmountText,
            {
              color: props.isDarkMode
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          {(props.sendingAmount / 1000).toLocaleString()} sat /{' '}
          {((fiatRate / 100000000) * (props.sendingAmount / 1000)).toFixed(2)}{' '}
          {'USD'}
        </Text>
        <Text
          style={[
            styles.valueAmountText,
            {
              color: props.isDarkMode
                ? COLORS.darkModeText
                : COLORS.lightModeText,
            },
          ]}>
          {props.paymentDescription
            ? props.paymentDescription
            : 'no description'}
        </Text>
      </View>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessageText}</Text>
      </View>
    </View>
  );

  async function generateLightningInvoice() {
    try {
      if (props.sendingAmount === 0) {
        console.log('reciving zero');
        setGeneratingQrCode(true);
        setErrorMessageText('Must recieve more than 0 sats');
        return;
      }
      const channelFee = await openChannelFee({
        amountMsat: props.sendingAmount,
      });

      setErrorMessageText('');
      setGeneratingQrCode(true);

      if (channelFee?.usedFeeParams) {
        setErrorMessageText(
          'Amount is above your reciveing capacity. Sending this payment will incur a 2,500 sat fee',
        );
      }

      const invoice = await receivePayment({
        amountMsat: props.sendingAmount,
        description: props.paymentDescription,
      });

      if (invoice) {
        setGeneratingQrCode(false);
        props.setGeneratedAddress(invoice.lnInvoice.bolt11);
      }
    } catch (err) {
      console.log(err, 'RECIVE ERROR');
    }
  }
}

const styles = StyleSheet.create({
  qrcodeContainer: {
    width: '90%',
    maxWidth: 250,
    height: 250,
    ...CENTER,

    marginVertical: 20,

    alignItems: 'center',
    justifyContent: 'center',
  },

  amountContainer: {
    alignItems: 'center',
    ...CENTER,
  },
  valueAmountText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.Descriptoin_Regular,
    marginBottom: 10,
  },

  errorContainer: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...CENTER,
  },
  errorText: {
    color: 'red',
    fontSize: SIZES.large,
    fontFamily: FONT.Descriptoin_Regular,
    textAlign: 'center',
  },
});
