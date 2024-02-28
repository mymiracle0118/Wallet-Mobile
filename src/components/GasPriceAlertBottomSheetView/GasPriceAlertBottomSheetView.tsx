import React, { memo, useMemo } from 'react';
import { View } from 'react-native';

import GasPriceAlertListView from 'components/GasPriceAlertListView/GasPriceAlertListView';
import useTheme from 'hooks/useTheme';

import BottomSheetWrapper from '../BottomSheetWrapper/BottomSheetWrapper';
import { style } from './style';

interface Props {
  title: string;
  isSheetOpen?: boolean;
  onClose: () => void;
  onPressSetAlerts: () => void;
  onPressDeleteAlert: (id: any) => void;
}

const GasPriceAlertBottomSheetView = (props: Props): React.JSX.Element => {
  const { Colors, Layout, Common } = useTheme();

  const snapPoints = useMemo(() => ['65%'], []);
  const { title, isSheetOpen, onClose, onPressSetAlerts, onPressDeleteAlert } =
    props;

  return isSheetOpen ? (
    <View style={{ ...Layout.absoluteFill }}>
      <BottomSheetWrapper
        onClose={onClose}
        isSheetOpen={isSheetOpen}
        bottomSheetBgStyle={style(Layout, Colors).bottomSheetBg}
        bottomSheetStyle={Common.bottomSheet}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: Colors.gray }}
        enablePanDownToClose
      >
        <GasPriceAlertListView
          title={title}
          onPressSetAlerts={onPressSetAlerts}
          onPressDeleteAlert={onPressDeleteAlert}
        />
      </BottomSheetWrapper>
    </View>
  ) : (
    <></>
  );
};
GasPriceAlertBottomSheetView.defaultProps = {
  isSheetOpen: false,
};
export default memo(GasPriceAlertBottomSheetView);
