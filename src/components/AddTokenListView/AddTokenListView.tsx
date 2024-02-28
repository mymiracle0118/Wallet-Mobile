import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

import AddTokenItem from 'components/AddTokenItem/AddTokenItem';
import useUpdateEffect from 'customHooks/useUpdateEffect';
import useTheme from 'hooks/useTheme';
import { t } from 'i18next';
import Variables from 'theme/Variables';
import { ExistingNetworksItem } from 'types/apiResponseInterfaces';

import { HorizontalSeparatorView, SearchInputBox } from '..';
import { style } from './style';

type Props = {
  items: any;
  testID: string;
  handleIsAddEnable: (item: ExistingNetworksItem) => void;
};

const AddTokenListView = (props: Props) => {
  const { items, testID, handleIsAddEnable } = props;
  const { Gutters, Fonts, Colors } = useTheme();

  const [searchText, setSearchText] = useState('');
  const [filterData, setFilterData] = useState([]);

  const [selectedId, setSelectedId] = useState('');

  useUpdateEffect(() => {
    let tokenList = [];
    if (searchText.trim().length > 0) {
      let searchList = [];
      for (const tokenObj of items) {
        if (tokenObj.title === 'wallet:all') {
          searchList = [];
          searchList = tokenObj?.data?.filter(function (item) {
            return (
              item?.subTitle
                ?.toLowerCase()
                .includes(searchText?.trim().toLowerCase()) ||
              item?.title
                ?.toLowerCase()
                .includes(searchText?.trim().toLowerCase()) ||
              item?.networkName
                ?.toLowerCase()
                .includes(searchText?.trim().toLowerCase())
            );
          });
        }
      }
      tokenList = searchList;
    }

    if (tokenList.length || searchText?.trim() !== '') {
      setFilterData([
        {
          title: tokenList.length ? 'wallet:all' : '',
          data: tokenList,
        },
      ]);
    } else {
      setFilterData(items);
    }
  }, [searchText]);

  const tokenListArray = useMemo(() => {
    return filterData.length ? filterData : items;
  }, [searchText, items, filterData]);

  return (
    <>
      <SearchInputBox
        placeholder={t('wallet:asset_name_symbol')}
        onChangeText={text => {
          setSearchText(text);
        }}
      />

      <HorizontalSeparatorView spacing={Variables.MetricsSizes.small} />

      <SectionList
        sections={tokenListArray}
        keyExtractor={item => item.id}
        bounces={false}
        renderItem={({ item }) => (
          <Pressable
            testID={testID}
            onPress={() => {
              if (item.id === selectedId) {
                setSelectedId('');
                handleIsAddEnable({});
              } else {
                setSelectedId(item.id);
                handleIsAddEnable(item);
              }
            }}
          >
            <AddTokenItem
              item={item}
              selectedId={selectedId}
              onSelect={() => {
                if (item.id === selectedId) {
                  setSelectedId('');
                  handleIsAddEnable({});
                } else {
                  setSelectedId(item.id);
                  handleIsAddEnable(item);
                }
              }}
            />
          </Pressable>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={style(Gutters, Colors).sectionTitleContainer}>
            <Text style={Fonts.textSmallDescriptionBold}>{t(title)}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
};

export default AddTokenListView;
