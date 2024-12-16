import WebView, {WebViewProps} from 'react-native-webview';

import {StyleProp, ViewStyle} from 'react-native';

export interface StylesFile {
  href: string;
  type: string;
  rel: string;
}

export interface SizeUpdate {
  width: number;
  height: number;
}

export interface WebViewAutoHeightProps extends WebViewProps {
  onSizeUpdated?: (size: SizeUpdate) => void;
  files?: StylesFile[];
  style?: StyleProp<ViewStyle>;
  customScript?: string;
  customStyle?: string;
  viewportContent?: string;
  scalesPageToFit?: boolean;
  scrollEnabledWithZoomedin?: boolean;
}

export default class WebViewAutoHeight extends WebView<
  WebViewAutoHeightProps
> {}
