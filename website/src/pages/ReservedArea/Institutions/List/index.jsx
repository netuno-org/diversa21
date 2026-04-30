import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Spin, Pagination, Empty, 
  Input, Select, Space, Avatar, Button, List, Row 
} from "antd";
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
  institutionsSetList, 
  institutionsSetFilters, 
  institutionsSetLoading 
} from '../../../../redux/actions/institutionsActions';

import "./index.less";

const { Title, Text } = Typography;
const { Option } = Select;

const PAGE_SIZE = 10;

function InstitutionList({ 
  institutionsState, 
  institutionsSetList, 
  institutionsSetFilters, 
  institutionsSetLoading,
  loggedUserInfo
}) {
  const navigate = useNavigate();
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { filters } = institutionsState;


  // Fetch all institutions for filtering
  useEffect(() => {
    setLoading(true);
    _service({
      url: "institution/list",
      method: 'GET',
      success: ({ json }) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        setAllInstitutions(items);
        
        // Extract unique countries
        const uniqueCountries = [...new Set(items.map(i => i.country).filter(Boolean))].sort();
        setCountries(uniqueCountries);
        
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    });
  }, []);

  // Filter states based on selected country
  useEffect(() => {
    if (filters.country) {
      const filteredStates = [...new Set(
        allInstitutions
          .filter(i => i.country === filters.country && i.state)
          .map(i => i.state)
      )].sort();
      setStates(filteredStates);
    } else {
      setStates([]);
    }
  }, [filters.country, allInstitutions]);

  // Compute filtered and paginated results
  const filteredInstitutions = useMemo(() => {
    let result = allInstitutions || [];
    
    // Filter by search name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(i => 
        i.name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by country
    if (filters.country) {
      result = result.filter(i => i.country === filters.country);
    }
    
    // Filter by state
    if (filters.state) {
      result = result.filter(i => i.state === filters.state);
    }
    
    // Filter by city
    if (filters.city) {
      const cityLower = filters.city.toLowerCase();
      result = result.filter(i => i.city?.toLowerCase().includes(cityLower));
    }
    
    return result;
  }, [allInstitutions, filters]);

  // Paginate results
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInstitutions.slice(start, start + PAGE_SIZE);
  }, [filteredInstitutions, currentPage]);

  const handleSearchChange = (value) => {
    institutionsSetFilters({ search: value });
  };

  const handleCountryChange = (value) => {
    institutionsSetFilters({ country: value, state: '' });
  };

  const handleStateChange = (value) => {
    institutionsSetFilters({ state: value });
  };

  const handleCityChange = (value) => {
    institutionsSetFilters({ city: value });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    institutionsSetFilters({ search: '', country: '', state: '', city: '' });
  };

  const hasFilters = filters.search || filters.country || filters.state || filters.city;

  const handleCardClick = (uid) => {
    navigate(`/institutions/${uid}`);
  };

  return (
    <section className="institutions-list">
      <div className="list-header">
        <Title level={1}>Instituições</Title>
        {(
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/institutions/new')}
          >
            Nova Instituição
          </Button>
        )}
      </div>

      <div className="filters-section">
        <Space wrap size="middle">
          <Input.Search
            placeholder="Buscar por nome..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearchChange}
            style={{ width: 280 }}
            onChange={(e) => handleSearchChange(e.target.value)}
            value={filters.search}
          />
          
          <Select
            placeholder="País"
            allowClear
            style={{ width: 180 }}
            onChange={handleCountryChange}
            value={filters.country || undefined}
            showSearch
            optionFilterProp="children"
          >
            {countries.map(country => (
              <Option key={country} value={country}>{country}</Option>
            ))}
          </Select>

          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 180 }}
            onChange={handleStateChange}
            value={filters.state || undefined}
            disabled={!filters.country}
            showSearch
            optionFilterProp="children"
          >
            {states.map(state => (
              <Option key={state} value={state}>{state}</Option>
            ))}
          </Select>

          <Input
            placeholder="Cidade"
            allowClear
            style={{ width: 180 }}
            onChange={(e) => handleCityChange(e.target.value)}
            value={filters.city}
          />

          {hasFilters && (
            <Button type="link" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredInstitutions.length === 0 ? (
        <Empty 
          description={hasFilters ? "Nenhuma instituição corresponde aos filtros aplicados." : "Nenhuma instituição encontrada."} 
        />
      ) : (
        <>
          <div className="results-info">
            <Text type="secondary">
              {filteredInstitutions.length} instituição{filteredInstitutions.length !== 1 ? 's' : ''} encontrada{filteredInstitutions.length !== 1 ? 's' : ''}
            </Text>
          </div>

          <List
              className="institution-list"
              itemLayout="horizontal"
              dataSource={paginatedInstitutions}
              renderItem={(institution) => (
                <List.Item
                  className="institution-list-item"
                  onClick={() => handleCardClick(institution.uid)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={
                      institution.logo ? (
                        <Avatar src={institution.logo} size={48} shape="square" />
                      ) : (
                        <Avatar size={48} shape="square" style={{ backgroundColor: '#8A6AA2' }}>
                          {institution.name?.[0]}
                        </Avatar>
                      )
                    }
                    title={
                      <div className="institution-list-title">
                        <Text strong>{institution.name}</Text>
                      </div>
                    }
                    description={
                      <div className="institution-list-description">
                        <Text type="secondary" ellipsis>
                          {institution.description || 'Sem descrição'}
                        </Text>
                        {(institution.city || institution.country) && (
                          <Text type="secondary" className="institution-location">
                            {institution.city}{institution.city && institution.country && ', '}{institution.country}
                          </Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

          <div className="pagination-wrapper">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredInstitutions.length}
              onChange={handlePageChange}
              showTotal={(total) => `${total} instituição${total !== 1 ? 's' : ''}`}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </section>
  );
}

const mapStateToProps = store => {
  const { institutionsState, loggedUserInfoState } = store;
  return {
    institutionsState,
    loggedUserInfo: loggedUserInfoState.loggedUserInfo
  };
};

const mapDispatchToProps = dispatch => bindActionCreators({
  institutionsSetList,
  institutionsSetFilters,
  institutionsSetLoading
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(InstitutionList);
