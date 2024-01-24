import {useEffect, useReducer, useRef, useState} from 'react';
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
  fetchFiatRates,
  openChannelFee,
  parseInvoice,
  receivePayment,
} from '@breeztech/react-native-breez-sdk';
import QRCode from 'react-native-qrcode-svg';
import {FONT, SIZES, CENTER, COLORS} from '../../../../constants';
import {useGlobalContextProvider} from '../../../../../context-store/context';
import {getLocalStorageItem, setLocalStorageItem} from '../../../../functions';

export default function LightningPage(props) {
  const isInitialRender = useRef(true);
  const [fiatRate, setFiatRate] = useState(0);
  const {nodeInformation} = useGlobalContextProvider();
  // const [generatingQrCode, setGeneratingQrCode] = useState(true);
  const [errorMessageText, setErrorMessageText] = useState('');

  useEffect(() => {
    if (props.selectedRecieveOption != 'lightning') {
      setErrorMessageText('');
      setFiatRate('');
      props.setGeneratingLNInvioce(true);
      isInitialRender.current = true;
      return;
    }
    if (!props.userSelectedCurrency) return;
    if (!nodeInformation.didConnectToNode) return;
    if (isInitialRender.current) {
      loadPrevGeneratedInvoice();
      isInitialRender.current = false;
    } else generateLightningInvoice();

    (async () => {
      try {
        const fiatRates = await fetchFiatRates();

        const [selectedPrice] = fiatRates.filter(
          rate =>
            rate.coin.toLowerCase() ===
            props.userSelectedCurrency.toLowerCase(),
        );
        // console.log(selectedPrice);
        setFiatRate(selectedPrice.value);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [
    props.selectedRecieveOption,
    props.updateQRCode,
    props.userSelectedCurrency,
  ]);
  return (
    <View
      style={{
        display: props.selectedRecieveOption === 'lightning' ? 'flex' : 'none',
      }}>
      <View style={[styles.qrcodeContainer]}>
        {/* ADD LOGIC HERE TO WAIT FOR ADDRESS TO ALSO BE GENERATED */}
        {props.generatingLNInvoice && (
          <ActivityIndicator
            size="large"
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
          />
        )}
        {!props.generatingLNInvoice && (
          <QRCode
            size={250}
            value={
              props.generatedAddress
                ? props.generatedAddress
                : 'Thanks for using Blitz!'
            }
            color={props.theme ? COLORS.darkModeText : COLORS.lightModeText}
            backgroundColor={
              props.theme
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
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
            },
          ]}>
          {(props.sendingAmount / 1000).toLocaleString()} sat /{' '}
          {((fiatRate / 100000000) * (props.sendingAmount / 1000)).toFixed(2)}{' '}
          {props.userSelectedCurrency}
        </Text>
        <Text
          style={[
            styles.valueAmountText,
            {
              color: props.theme ? COLORS.darkModeText : COLORS.lightModeText,
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
      props.setGeneratingLNInvioce(true);

      if (props.sendingAmount === 0) {
        setErrorMessageText('Must set invoice for more than 0 sats');
        return;
      }

      setErrorMessageText('');

      if (nodeInformation.inboundLiquidityMsat < props.sendingAmount) {
        const channelFee = await openChannelFee({
          amountMsat: props.sendingAmount,
        });
        setErrorMessageText(
          `Amount is above your reciveing capacity. Sending this payment will incur a ${Math.ceil(
            channelFee.feeMsat / 1000,
          ).toLocaleString()} sat fee`,
        );
      }

      const invoice = await receivePayment({
        amountMsat: props.sendingAmount,
        description: props.paymentDescription,
      });

      if (invoice) {
        props.setGeneratingLNInvioce(false);
        props.setGeneratedAddress(invoice.lnInvoice.bolt11);
      }
    } catch (err) {
      console.log(err, 'RECIVE ERROR');
    }
  }

  async function loadPrevGeneratedInvoice() {
    const MILISECONDSCONST = 1000;
    const BUFFERTIMECONST = 300000;
    try {
      const prevInvoice = await getLocalStorageItem('lnInvoice');
      let parsedInvoice = JSON.parse(prevInvoice);
      const currentTime = new Date();

      const prevInvoiceTime = new Date(
        parsedInvoice?.lnInvoice.expiry * MILISECONDSCONST +
          parsedInvoice?.lnInvoice.timestamp * MILISECONDSCONST +
          BUFFERTIMECONST,
      );

      const txLookup =
        nodeInformation.transactions.length > 10
          ? nodeInformation.transactions.length > 50
            ? nodeInformation.transactions.slice(0, 50)
            : nodeInformation.transactions.slice(0, 10)
          : nodeInformation.transactions;

      const wasUsed = txLookup.filter(tx => {
        if (
          tx.details.data.paymentHash === parsedInvoice?.lnInvoice.paymentHash
        )
          return true;
        else return false;
      });

      if (
        currentTime.getTime() > prevInvoiceTime.getTime() ||
        wasUsed.length != 0 ||
        !parsedInvoice
      ) {
        parsedInvoice = await receivePayment({
          amountMsat: 1000,
          description: '',
        });
        setLocalStorageItem('lnInvoice', JSON.stringify(parsedInvoice));
      }

      props.setGeneratedAddress(parsedInvoice.lnInvoice.bolt11);
      props.setSendingAmount(prev => {
        return {
          ...prev,
          lightning: parsedInvoice.lnInvoice.amountMsat,
        };
      });
      props.setGeneratingLNInvioce(false);
    } catch (err) {
      console.log(err);
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
