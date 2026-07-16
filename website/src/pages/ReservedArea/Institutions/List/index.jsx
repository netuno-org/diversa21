import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Spin, Pagination, Empty, Typography, Grid, Tag, Button } from 'antd';
import { UserAddOutlined, EditOutlined } from '@ant-design/icons';

import InstitutionDisplay from "../../../../components/InstitutionDisplay";
import usePeople from "../../../../common/usePeople.js";
import useFilteredPaginatedList from '../../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from "../../../../components/ListHeaderFilters";

import "./index.less";

const { Text } = Typography;
const { useBreakpoint } = Grid;

function ListInstitution() {
  const loggedUser = usePeople();
  const {
    items: institutionList,
    loading,
    pagination,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
  } = useFilteredPaginatedList({
    serviceUrl: 'institution/list',
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
          onSearch={handleSearch}
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
                <Link
                  to={`/institutions/${institution.slug}`}
                  className={`institutions-list__card-link ${(!institution.active || institution.active === "false") ? 'institutions-list__card-link--inactive' : ''}`}
                >
                  <InstitutionDisplay
                    institution={institution}
                    avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }}
                  />
                </Link>
              </div>
              
              {(loggedUser.canManageInstitution(institution.uid) || loggedUser.canCreateInstitutions()) && (
                <div className="institutions-list__card-actions">
                  {(institution.active === false || institution.active === "false") && (
                    <Tag variant="filled" color="error" className="institutions-list__card-status-tag" style={{ borderRadius: '32px' }}>
                      Inativa
                    </Tag>
                  )}
                  <Button
                    type="link"
                    onClick={() => navigate(`/institutions/${institution.slug}/edit`)}
                    className="institutions-list__card-btn institutions-list__card-btn--edit"
                  >
                    <EditOutlined />
                  </Button>
                </div>
              )}
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