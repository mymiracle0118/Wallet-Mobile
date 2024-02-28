/* eslint-disable @typescript-eslint/no-unused-vars */
import { gutters, layout } from 'theme';
import BorderRadius from 'theme/BorderRadius';
import getStyleSheet from 'theme/Helper/currentStyleSheet';
import Variables from 'theme/Variables';

export const style = (
  Gutters: typeof gutters,
  Layout: typeof layout,
  Colors: typeof Variables.Colors,
) => {
  return getStyleSheet().create({
    container: {
      ...Layout.absolute,
      ...Layout.top0,
      ...Layout.bottom0,
      ...Layout.left0,
      ...Layout.right0,
    },
    maskImageBg: {
      ...Layout.absolute,
      ...Layout.top0,
      ...Layout.bottom0,
      ...Layout.left0,
      ...Layout.right0,
      ...BorderRadius.ExtraMediumBorderRadius,
      overflow: 'hidden',
    },
    maskOverLayView: {
      ...Layout.absolute,
      alignSelf: 'center',
      ...Layout.alignItemsCenter,
      ...Layout.bottom0,
      ...Layout.top0,
      ...Layout.row,
    },
    image: { width: 31, height: 22 },
  });
};
