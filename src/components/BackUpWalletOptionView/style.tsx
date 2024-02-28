import { gutters, layout } from 'theme';
import BorderRadius from 'theme/BorderRadius';
import getStyleSheet from 'theme/Helper/currentStyleSheet';
import Variables from 'theme/Variables';

export const style = (
  Gutters: typeof gutters,
  Layout: typeof layout,
  Colors: typeof Variables.Colors,
  TopImageSize?: number,
) => {
  return getStyleSheet().create({
    topImageContainer: { zIndex: 1, alignSelf: 'center' },
    topImage: {
      height: TopImageSize,
      width: TopImageSize,
      marginBottom: -((TopImageSize ?? 0) / 2),
    },
    container: {
      backgroundColor: Colors.inputBackground,
      paddingHorizontal: 24,
      ...BorderRadius.LargeBorderRadius,
      paddingTop: (TopImageSize ?? 0) / 2,
    },
    titleDescriptionView: {
      backgroundColor: Colors.transparent,
      padding: 0,
      ...Gutters.mediumVMargin,
    },
    titleDescriptionViewTitle: {
      ...Gutters.tinyBMargin,
      fontSize: Variables.FontSize.mediumMedium,
      ...Layout.textAlignCenter,
    },
    titleDescriptionViewSubTitle: {
      fontSize: Variables.FontSize.smallRegular,
      ...Layout.textAlignCenter,
    },
    backupInfoViewTitle: { ...Gutters.mediumBMargin },
    button: { ...Gutters.mediumBMargin },
  });
};
