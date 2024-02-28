import { gutters } from 'theme';
import getStyleSheet from 'theme/Helper/currentStyleSheet';

export const style = (Gutters: typeof gutters) => {
  return getStyleSheet().create({
    rootContainer: { marginTop: -80 },
    title: {
      ...Gutters.tinyTMargin,
    },
    subTitle: {
      ...Gutters.extraTinyTMargin,
      ...Gutters.smallBMargin,
      letterSpacing: 7,
    },
  });
};
