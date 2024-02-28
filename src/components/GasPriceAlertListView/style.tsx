import { gutters, layout } from 'theme';
import getStyleSheet from 'theme/Helper/currentStyleSheet';

export const styles = (Gutters: typeof gutters, Layout: typeof layout) => {
  return getStyleSheet().create({
    titleText: {
      ...Layout.textAlignCenter,
    },
    buttonStyle: {
      ...Gutters.smallMargin,
    },
    rawItemRootConatiner: {
      ...Layout.fill,
      ...Gutters.extraTinyVMargin,
      ...Layout.row,
      ...Layout.alignItemsCenter,
      ...Layout.justifyContentBetween,
      ...Gutters.smallHPadding,
    },
    textContainer: {
      ...Gutters.tinyVPadding,
    },
    trashIcon: { width: 20, height: 22 },
  });
};
