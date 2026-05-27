import { useState } from 'react';
import { Typography, Tabs } from "antd";
import { BiSolidLocationPlus } from "react-icons/bi";

import useLocations from '../../../../common/useLocations.js';
import usePeople from '../../../../common/usePeople.js';
import ListHeaderFilters from '../../../../components/ListHeaderFilters/index.jsx';

import LocationTable from './../Table/index.jsx';
import LocationModal from './../Modal/index.jsx';

import './index.less';

const { Text } = Typography;

function LocationList() {
  // Fetch global location data and filtering logic from our custom hook
  const {
    allCountries, allStates,
    filteredCountries, filteredStates, filteredCities,
    loading, reload, filters, setFilters
  } = useLocations();

  const loggedUser = usePeople();

  // Component state management
  const [activeTab, setActiveTab] = useState('country');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const jumpToMatchTable = (term) => {
    if (term && term.trim() !== '') {
      const q = term.toLowerCase();

      // Do nothing if a match is already present in the currently active tab
      if ((activeTab === 'country' && allCountries.some(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)))
        || (activeTab === 'state' && allStates.some(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)))
        || (activeTab === 'city' && filteredCities.some(c => c.name?.toLowerCase().includes(q)))) {
        return;
      }

      // Switch to the highest-level tab that contains a match
      if (allCountries.some(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))) {
        setActiveTab('country');
      } else if (allStates.some(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q))) {
        setActiveTab('state');
      } else if (filteredCities.some(c => c.name?.toLowerCase().includes(q))) {
        setActiveTab('city');
      }
    }
  }

  // Handle manual text search input
  const handleLocationSearch = (term) => {
    setFilters(prev => ({ ...prev, term }));
    setPagination(prev => ({ ...prev, current: 1 }));
    jumpToMatchTable(term);
  };

  // Clear text search
  const handleSearchClear = () => {
    setFilters(prev => ({ ...prev, term: '' }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Automatically switch to the tab matching the selected location type
  const handleLocationChange = (option) => {
    setFilters(prev => ({ ...prev, location: option || null }));
    setPagination(prev => ({ ...prev, current: 1 }));

    // Automatically switch to the tab matching the selected location type
    if (option?.type) {
      setActiveTab(option.type);
    }
  };

  // Clear dropdown selection
  const handleLocationClear = () => {
    setFilters(prev => ({ ...prev, location: null }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Determine which dataset to pass to the table based on the active tab
  const currentData = activeTab === 'country' ? filteredCountries
    : activeTab === 'state' ? filteredStates
      : filteredCities;

  return (
    <div className="locations-list">
      <div className="locations-list__search">
        <ListHeaderFilters
          title="Localidades"
          createButton={loggedUser.canManageLocations() && {
            icon: <BiSolidLocationPlus />,
            text: 'Novo registo',
            onClick: () => {
              setEditingItem(null);
              setIsModalVisible(true);
            },
          }}
          onSearch={handleLocationSearch}
          onSearchClear={handleSearchClear}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
        />
      </div>

      <div className="locations-list__results">
        <Text type='secondary'>
          {activeTab === 'country' && (currentData.length === 1 ? '1 país' : `${currentData.length} países`)}
          {activeTab === 'state' && (currentData.length === 1 ? '1 estado' : `${currentData.length} estados`)}
          {activeTab === 'city' && (currentData.length === 1 ? '1 cidade' : `${currentData.length} cidades`)}
        </Text>
      </div>

      <div className="locations-list__content">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          items={[
            { key: 'country', label: 'Países' },
            { key: 'state', label: 'Estados' },
            { key: 'city', label: 'Cidades' },
          ].map(tab => ({
            ...tab,
            children: (
              <LocationTable
                activeTab={tab.key}
                data={currentData}
                loading={loading[tab.key]}
                pagination={pagination}
                setPagination={setPagination}
                onEdit={(record) => {
                  setEditingItem(record);
                  setIsModalVisible(true);
                }}
                onDeleteSuccess={() => reload(tab.key)}
              />
            )
          }))}
        />

        <LocationModal
          visible={isModalVisible}
          activeTab={activeTab}
          editingItem={editingItem}
          allCountries={allCountries}
          allStates={allStates}
          onClose={() => {
            setIsModalVisible(false);
            setEditingItem(null);
          }}
          onSuccess={() => reload(activeTab)}
        />
      </div>
    </div>
  );
}

export default LocationList;