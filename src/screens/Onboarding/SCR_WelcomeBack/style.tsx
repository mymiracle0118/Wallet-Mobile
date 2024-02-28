import { gutters, layout } from 'theme';
import BorderRadius from 'theme/BorderRadius';
import getStyleSheet from 'theme/Helper/currentStyleSheet';

export const style = (Gutters: typeof gutters, Layout: typeof layout) => {
  return getStyleSheet().create({
    subView: {
      ...Layout.fill,
      ...Gutters.tinySmallPadding,
      ...Layout.alignItemsCenter,
      ...BorderRadius.MediumBorderRadius,
    },
    icon: {
      ...Layout.fullSize,
      height: 80,
      width: 80,
      marginTop: 100,
    },
    title: {
      ...Gutters.tinyTMargin,
    },
    subTitle: {
      ...Gutters.extraTinyTMargin,
      ...Gutters.smallBMargin,
      letterSpacing: 7,
    },
    bottomView: {
      ...Gutters.regularBPadding,
    },
  });
};
