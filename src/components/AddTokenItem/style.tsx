import { gutters, layout } from 'theme';
import getStyleSheet from 'theme/Helper/currentStyleSheet';

export const style = (Gutters: typeof gutters, Layout: typeof layout) => {
  return getStyleSheet().create({
    container: {
      ...Gutters.extraTinyVMargin,
      ...Layout.row,
      ...Layout.alignItemsCenter,
    },
    subView: {
      ...Layout.fill,
      ...Layout.row,
      ...Layout.justifyContentBetween,
      ...Gutters.tinyLMargin,
      ...Gutters.tinyVMargin,
    },
    icon: {
      width: 30,
      height: 30,
    },
    checkBox: {
      ...Gutters.tinyMediumLMargin,
    },
  });
};
