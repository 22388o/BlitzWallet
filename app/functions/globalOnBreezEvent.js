import {nodeInfo} from '@breeztech/react-native-breez-sdk';
import {useGlobalContextProvider} from '../../context-store/context';
import {getTransactions} from './SDK';
import {useNavigation} from '@react-navigation/native';

// SDK events listener

const logHandler = logEntry => {
  if (logEntry.level != 'TRACE') {
    console.log(`[${logEntry.level}]: ${logEntry.line}`);
  }
};

export default function globalOnBreezEvent() {
  const navigate = useNavigation();
  const {toggleBreezContextEvent} = useGlobalContextProvider();

  return function onBreezEvent(e) {
    console.log('RUNNING IN THIS FUNCTION');
    console.log(e);

    if (
      e?.type != 'invoicePaid' &&
      e?.type != 'paymentSucceed' &&
      e?.type != 'paymentFailed'
    )
      return;

    updateGlobalNodeInformation(e);
    toggleBreezContextEvent(e);

    if (
      e?.type === 'invoicePaid' &&
      e.details.payment.description?.includes('bwrfd')
    )
      return;

    // if (e.details.payment.description?.includes('bwrfd')) return;
    if (navigate.canGoBack()) navigate.navigate('HomeAdmin');
    navigate.navigate('ConfirmTxPage', {
      for: e.type,
      information: e,
    });
  };
}

async function updateGlobalNodeInformation(e) {
  const transactions = await getTransactions();
  const nodeState = await nodeInfo();
  const msatToSat = nodeState.channelsBalanceMsat / 1000;

  toggleNodeInformation({
    transactions: transactions,
    userBalance:
      e.type === 'invoicePaid'
        ? e.details.payment.amountMsat / 1000 + msatToSat
        : msatToSat,
    inboundLiquidityMsat:
      e.type === 'invoicePaid'
        ? Math.abs(
            e.details.payment.amountMsat / 1000 -
              nodeState.inboundLiquidityMsats,
          )
        : nodeState.inboundLiquidityMsats,
    blockHeight: nodeState.blockHeight,
    onChainBalance: nodeState.onchainBalanceMsat,
  });
  await setLocalStorageItem(
    'breezInfo',
    JSON.stringify([
      transactions,
      msatToSat,
      nodeState.inboundLiquidityMsats,
      nodeState.blockHeight,
      nodeState.onchainBalanceMsat,
    ]),
  );
}
