import React, { useState, useEffect, forwardRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';

import {
  topic,
  reduceData,
  getWidth,
  isSizeChanged,
  shouldUpdate,
} from './utils';

const WebViewAutoHeight = React.memo(
  forwardRef(({
    style = { height: 0 },
    onMessage,
    onSizeUpdated,
    scrollEnabledWithZoomedin = false,
    scrollEnabled = false,
    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,
    originWhitelist = ['*'],
    scalesPageToFit = Platform.OS === 'android' ? false : undefined,
    viewportContent = Platform.OS === 'ios' ? 'width=device-width' : undefined,
    ...props
  }, ref) => {

    const [size, setSize] = useState({
      height: style.height || 0,
      width: getWidth(style),
    });

    const [scrollable, setScrollable] = useState(false);

    const handleMessage = (event) => {

      if (event.nativeEvent) {

        try {
          const data = JSON.parse(event.nativeEvent.data);

          if (data.topic !== topic) {
            onMessage && onMessage(event);
            return;
          }

          const { height, width, zoomedin } = data;

          !scrollEnabled &&
            scrollEnabledWithZoomedin &&
            setScrollable(!!zoomedin);

          const { height: previousHeight, width: previousWidth } = size;

          if (
            isSizeChanged({ height, previousHeight, width, previousWidth }) &&
            Math.abs(height - previousHeight) > 1 // Evitar actualizaciones por pequeñas variaciones
          ) {
            setSize({ height, width });
          }

        } catch (error) {
          onMessage && onMessage(event);
        }
      } else {
        onMessage && onMessage(event);
      }
    };

    const currentScrollEnabled =
      scrollEnabled === false && scrollEnabledWithZoomedin
        ? scrollable
        : scrollEnabled;

    const { currentSource, script } = reduceData(props);

    const { width, height } = size;

    useEffect(() => {
      onSizeUpdated &&
        onSizeUpdated({
          height,
          width,
        });
    }, [width, height, onSizeUpdated]);

    return React.createElement(WebView, {
      ...props,
      ref,
      onMessage: handleMessage,
      style: [
        styles.webView,
        { width, height },
        style,
      ],
      injectedJavaScript: script,
      source: currentSource,
      scrollEnabled: currentScrollEnabled,
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      originWhitelist,
      scalesPageToFit,
      viewportContent,
    });

  }),

  (prevProps, nextProps) => !shouldUpdate({ prevProps, nextProps }),

);

WebViewAutoHeight.propTypes = {
  onSizeUpdated: PropTypes.func,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string,
      type: PropTypes.string,
      rel: PropTypes.string,
    }),
  ),
  style: ViewPropTypes.style,
  customScript: PropTypes.string,
  customStyle: PropTypes.string,
  viewportContent: PropTypes.string,
  scrollEnabledWithZoomedin: PropTypes.bool,
  // webview props
  originWhitelist: PropTypes.arrayOf(PropTypes.string),
  onMessage: PropTypes.func,
  scalesPageToFit: PropTypes.bool,
  source: PropTypes.object,
};

const styles = StyleSheet.create({
  webView: {
    backgroundColor: 'transparent',
  },
});

export default WebViewAutoHeight;