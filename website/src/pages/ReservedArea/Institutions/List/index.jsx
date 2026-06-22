import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Spin, Pagination, Empty, Typography, Grid } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';

import InstitutionDisplay from "../../../../components/InstitutionDisplay";
import usePeople from "../../../../common/usePeople.js";
import ListHeaderFilters from "../../../../components/ListHeaderFilters";

import "./index.less";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function ListInstitution() {
  const loggedUser = usePeople();
  const [loading, setLoading] = useState(true);
  const [institutionList, setInstitutionList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    term: '',
    location: null
  });
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const screenSize = screens.xl
    ? 100
    : screens.lg
      ? 100
      : screens.md
        ? 100
        : screens.sm
          ? 90
          : 70;

  useEffect(() => {
    fetchInstitutionList('', null, 1);
  }, []);

  const fetchInstitutionList = (term, location, page) => {
    setLoading(true);
    _service({
      url: 'institution/list',
      data: {
        name: term,
        ...(location && { [location.type + "Uid"]: location.uid }),
        page,
      },
      success: (response) => {
        const { items, pagination: responsePagination } = response.json.data;
        setInstitutionList(items);
        setPagination((currentPagination) => ({
          ...currentPagination,
          current: page,
          term,
          location,
          total: responsePagination.totalCount,
          size: responsePagination.pageSize
        }));
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, size: pageSize });
    fetchInstitutionList(pagination.term, pagination.location, page);
  };

  const handleInstitutionSearch = (term) => {
    setPagination({ ...pagination, current: 1, term });
    fetchInstitutionList(term, pagination.location, 1);
  };

  const handleLocationChange = (option) => {
    setPagination({ ...pagination, current: 1, location: option });
    fetchInstitutionList(pagination.term, option, 1);
  };

  const handleLocationClear = () => {
    setPagination({ ...pagination, current: 1, location: null });
    fetchInstitutionList(pagination.term, null, 1);
  };

  const handleSearchClear = () => {
    setPagination({ ...pagination, current: 1, term: '' });
    fetchInstitutionList('', pagination.location, 1);
  };

  return (
    <div className="institutions-list">
      <div className="institutions-list__header">
        <ListHeaderFilters
          title="Instituições"
          createButton={loggedUser.canCreateInstitutions() && {
            icon: <UserAddOutlined />,
            text: "Criar Instituição",
            onClick: () => navigate('/institutions/new'),
          }}
          onSearch={handleInstitutionSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
        />
      </div>

      {loading && (
        <div className="institutions-list__loading">
          <Spin size="large" />
        </div>
      )}

      <div className="institutions-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'instituições' : 'instituição'} encontrada{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>

      <div className="institutions-list__items">
        {!loading && institutionList.map((institution) => (
          <Card key={institution.uid} className="institutions-list__card">
            <div className="institutions-list__card-content">
              <div className="institutions-list__card-info">
                <Link to={`/institutions/${institution.slug}`} className="institutions-list__card-link">
                  <InstitutionDisplay 
                    institution={institution} 
                    avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} 
                  />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="institutions-list__footer">
        <Pagination
          className={`institutions-list__pagination ${institutionList.length === 0 && !loading ? 'institutions-list__pagination--hidden' : ''}`}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {institutionList.length === 0 && !loading && (
          <div className="institutions-list__empty">
            <Empty description="Nenhuma instituição encontrada corresponde aos filtros aplicados." />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListInstitution;