import React from 'react';
import { View, Image } from 'react-native';

import useTheme from 'hooks/useTheme';

import { Button, TitleDescriptionView } from '..';
import { style } from './style';

const avatarBgImageSize = 160;

type Props = {
  title: string;
  description: string;
  backUpInfoTitle?: string;
  backUpInfoSubtitle?: string;
  buttonText: string;
  onClick: () => void;
};

const BackUpWalletOptionView: React.FC<Props> = ({
  title,
  description,
  backUpInfoTitle,
  backUpInfoSubtitle,
  buttonText,
  onClick,
}) => {
  const { Colors, Layout, Gutters, Images } = useTheme();
  const shouldShowBackUpInfo = backUpInfoTitle || backUpInfoSubtitle;

  return (
    <>
      {/* top image wrapper view */}
      <View style={style(Gutters, Layout, Colors).topImageContainer}>
        <Image
          style={style(Gutters, Layout, Colors, avatarBgImageSize).topImage}
          source={Images.ic_backUpWalletAvatarBg}
        />
      </View>
      {/* container view */}
      <View style={style(Gutters, Layout, Colors, avatarBgImageSize).container}>
        {/* title description view */}
        <TitleDescriptionView
          containerStyle={style(Gutters, Layout, Colors).titleDescriptionView}
          title={title}
          subTitle={description}
          titleStyle={style(Gutters, Layout, Colors).titleDescriptionViewTitle}
          subTitleStyle={
            style(Gutters, Layout, Colors).titleDescriptionViewSubTitle
          }
        />
        {/* backup info view */}
        {shouldShowBackUpInfo && (
          <TitleDescriptionView
            containerStyle={style(Gutters, Layout, Colors).backupInfoViewTitle}
            title={backUpInfoTitle ?? ''}
            subTitle={backUpInfoSubtitle}
          />
        )}
        {/* submit button */}
        <Button
          btnStyle={style(Gutters, Layout, Colors).button}
          text={buttonText}
          onPress={onClick} // Assuming the Button component accepts an onPress prop
        />
      </View>
    </>
  );
};

// Default props for optional props
BackUpWalletOptionView.defaultProps = {
  backUpInfoTitle: '',
  backUpInfoSubtitle: '',
};

export default BackUpWalletOptionView;
