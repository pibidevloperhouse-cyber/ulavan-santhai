import React, { useEffect, useRef } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function BuyerCheckout({ order, onResult, onCancel, planName = 'Buyer Verified Plan' }) {
  const frame = useRef(null);
  const delivered = useRef(false);
  function receive(message) {
    if (delivered.current) return;
    if (message?.type === 'close') return onCancel();
    if (message?.type === 'error') return onCancel('Checkout could not load. Please try again.');
    if (message?.type !== 'paid' || message.receipt?.razorpay_order_id !== order.orderId) return;
    delivered.current = true;
    onResult(message.receipt);
  }

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    function listen(event) {
      if (event.source === frame.current?.contentWindow) receive(event.data);
    }
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  });

  const options = JSON.stringify({
    key: order.keyId, order_id: order.orderId, amount: order.amount,
    currency: order.currency, name: 'UlavanMart', description: planName,
    theme: { color: '#174B35' },
  }).replace(/</g, '\\u003c');
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
    <script>
      function send(data) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(data));
        else window.parent.postMessage(data, '*');
      }
    </script>
    <script src="https://checkout.razorpay.com/v1/checkout.js" onerror="send({type:'error'})"></script>
    <script>
      if (window.Razorpay) new Razorpay(Object.assign(${options}, {
        handler: function(receipt){send({type:'paid',receipt:receipt})},
        modal: {ondismiss:function(){send({type:'close'})}}
      })).open();
    </script></body></html>`;
  return (
    <Modal onRequestClose={() => onCancel()} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <Pressable accessibilityRole="button" onPress={() => onCancel()} style={{ padding: 16 }}>
          <Text>←  Back to payment</Text>
        </Pressable>
        {Platform.OS === 'web' ? (
          <iframe ref={frame} title={planName + ' checkout'} srcDoc={html}
            style={{ flex: 1, width: '100%', border: 0 }} allow="payment" />
        ) : (
          <WebView source={{ html }} originWhitelist={['about:blank', 'https://*']}
            onMessage={event => {
              try { receive(JSON.parse(event.nativeEvent.data)); } catch { /* Ignore unrelated gateway messages. */ }
            }} />
        )}
      </SafeAreaView>
    </Modal>
  );
}
