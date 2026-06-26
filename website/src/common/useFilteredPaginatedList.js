import { useCallback, useEffect, useState } from 'react';
import _service from '@netuno/service-client';

const defaultPagination = {
  current: 1,
  size: 10,
  total: 0,
  term: '',
  location: null,
};

function useFilteredPaginatedList({ serviceUrl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(defaultPagination);

  const fetchList = useCallback(({
    term = pagination.term,
    location = pagination.location,
    page = pagination.current
  } = {}) => {

    setLoading(true);

    _service({
      url: serviceUrl,
      data: {
        name: term,
        ...(location && {
          [`${location.type}Uid`]: location.uid
        }),
        page,
      },

      success: (response) => {
        const { items, pagination: responsePagination } = response.json.data;

        setItems(items);

        setPagination((currentPagination) => ({
          ...currentPagination,
          current: page,
          term,
          location,
          total: responsePagination.totalCount,
          size: responsePagination.pageSize,
        }));

        setLoading(false);
      },

      fail: () => {
        setLoading(false);
      }
    });

  }, [serviceUrl, pagination]);

  useEffect(() => {
    fetchList();
  }, []);

  const handlePaginationChange = (page, pageSize) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: page,
      size: pageSize,
    }));

    fetchList({
      page,
    });
  };

  const handleSearch = (term) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      term,
    }));

    fetchList({
      term,
      page: 1,
    });
  };

  const handleLocationChange = (location) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      location,
    }));

    fetchList({
      location,
      page: 1,
    });
  };

  const handleLocationClear = () => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      location: null,
    }));

    fetchList({
      location: null,
      page: 1,
    });
  };

  const handleSearchClear = () => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      term: '',
    }));

    fetchList({
      term: '',
      page: 1,
    });
  };

  const refresh = () => {
    fetchList();
  };
  return {
    items,
    loading,
    pagination,
    fetchList,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
    refresh,
  };
}

export default useFilteredPaginatedList;