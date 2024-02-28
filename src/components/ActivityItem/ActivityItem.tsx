import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { t } from 'i18next';
import {
  dateTimeConvert,
  formatErc20Token,
  formatEther,
} from 'theme/Helper/common/Function';
import { NetWorkType } from 'theme/Helper/constant';
import { ActivityItemInterface } from 'types/apiResponseInterfaces';

import { useTheme } from '../../hooks';
import { style } from './styles';

type Props = {
  item: ActivityItemInterface;
  tokenType: string;
  onPress: () => void;
  shouldShowVerify?: boolean;
  walletAddress: string;
  shouldShowBalance?: boolean;
};

const ActivityItem = ({
  item,
  tokenType,
  onPress,
  shouldShowVerify,
  walletAddress,
  shouldShowBalance,
}: Props) => {
  const { Layout, Gutters, Fonts, Colors, Images } = useTheme();

  return (
    <Pressable style={[style(Gutters, Layout).container]} onPress={onPress}>
      <View style={style(Gutters, Layout).subView}>
        <View style={[style(Gutters, Layout).iconView]}>
          <Image
            style={style(Gutters, Layout).icon}
            source={
              walletAddress?.toLowerCase() === item?.from?.toLowerCase()
                ? Images.ic_send
                : Images.ic_receive
            }
          />
          <View>
            <Text style={[Fonts.titleSmall]}>
              {walletAddress?.toLowerCase() === item?.from?.toLowerCase()
                ? t('common:Send')
                : t('common:Receive')}
            </Text>
            {item?.timeStamp && (
              <Text style={[Fonts.textTinyGrayLightRegular]}>
                {dateTimeConvert(item?.timeStamp)}
              </Text>
            )}
          </View>
        </View>

        <View style={[Layout.alignItemsEnd]}>
          <Text style={[Fonts.titleSmall]}>
            {!shouldShowBalance
              ? `${
                  item?.tokenDecimal
                    ? formatErc20Token(
                        item?.value ?? 0,
                        parseInt(item?.tokenDecimal, 10),
                      )
                    : formatEther(item?.value ?? 0)
                } ${tokenType}`
              : t('common:hidden_symbol')}
          </Text>
          <View style={Layout.rowCenter}>
            {shouldShowVerify && (
              <Image
                style={style(Gutters, Layout).verifyIcon}
                source={Images.ic_verify}
              />
            )}

            <Text
              style={[
                Fonts.textTinyRegular,
                {
                  color:
                    item?.txreceipt_status === '2'
                      ? Colors.textPurple
                      : item?.txreceipt_status === '3' ||
                        item?.txreceipt_status === '4' ||
                        ((item?.tokenDecimal
                          ? formatErc20Token(
                              item?.value,
                              parseInt(item?.tokenDecimal, 10),
                            ) === '0.0'
                          : formatEther(item?.value ?? 0) === '0.0') &&
                          tokenType !== NetWorkType.APT &&
                          item?.from?.toLowerCase() !== item?.to?.toLowerCase())
                      ? Colors.textError
                      : Colors.white,
                },
              ]}
            >
              {item?.txreceipt_status === '2'
                ? t('wallet:pending')
                : item?.txreceipt_status === '3'
                ? t('wallet:failed')
                : item?.txreceipt_status === '4' ||
                  ((item?.tokenDecimal
                    ? formatErc20Token(
                        item?.value,
                        parseInt(item?.tokenDecimal, 10),
                      ) === '0.0'
                    : formatEther(item?.value ?? 0) === '0.0') &&
                    tokenType !== NetWorkType.APT &&
                    item?.from?.toLowerCase() !== item?.to?.toLowerCase())
                ? t('wallet:cancelled')
                : t('wallet:completed')}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

ActivityItem.defaultProps = {
  shouldShowVerify: false,
  shouldShowBalance: false,
};

export default ActivityItem;
