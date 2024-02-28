import { gutters, layout } from 'theme';
import BorderRadius from 'theme/BorderRadius';
import getStyleSheet from 'theme/Helper/currentStyleSheet';

export const style = (
  Gutters: typeof gutters,
  Layout: typeof layout,
  pressed: boolean,
  color: string,
) => {
  return getStyleSheet().create({
    button: {
      ...Gutters.tinySmallPadding,
      ...Layout.colCenter,
      backgroundColor: pressed ? color : color,
      ...BorderRadius.MediumBorderRadius,
    },
  });
};
