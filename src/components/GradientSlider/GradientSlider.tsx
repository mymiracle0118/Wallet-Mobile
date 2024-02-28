import React, { Dispatch, SetStateAction } from 'react';
import { width } from 'react-native-size-scaling';
import { scale } from 'react-native-size-scaling';

import MultiSlider from '@ptomasroos/react-native-multi-slider';
import useTheme from 'hooks/useTheme';

import { style } from './styles';

type Props = {
  sliderValue: number;
  setSliderValue: Dispatch<SetStateAction<number>>;
  minValue: number;
};

const GradientSlider = ({ sliderValue, setSliderValue, minValue }: Props) => {
  const { Layout, Colors } = useTheme();

  return (
    <MultiSlider
      containerStyle={style(Layout, Colors).containerStyle}
      sliderLength={width - scale(70)}
      min={sliderValue}
      trackStyle={style(Layout, Colors).trackStyle}
      step={0.5}
      onValuesChange={brightness => {
        setSliderValue(brightness[0] > minValue ? brightness[0] : minValue);
      }}
      max={50}
      colorGradient={Colors.primaryReversGradientColor}
      markerStyle={style(Layout, Colors).markerStyle}
    />
  );
};

export default GradientSlider;
