import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';

import _service from '@netuno/service-client';

const CONFIGS = {
  country: { url: 'location/country', label: 'países' },
  state: { url: 'location/state', label: 'estados' },
  city: { url: 'location/city', label: 'cidades' },
};

function useLocations() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({
    country: false,
    state: false,
    city: false,
  });

  const [filters, setFilters] = useState({ term: '', location: null });

  const loadData = useCallback((type, setter) => {
    const { url, label } = CONFIGS[type];

    setLoading(l => ({ ...l, [type]: true }));

    _service({
      url,
      method: 'GET',
      success: ({ json }) => {
        setter(Array.isArray(json?.data) ? json.data : []);
        setLoading(l => ({ ...l, [type]: false }));
      },
      fail: () => {
        message.error(`Falha ao carregar ${label}.`);
        setLoading(l => ({ ...l, [type]: false }));
      },
    });
  }, []);

  const loadCountries = useCallback(() => loadData('country', setCountries), [loadData]);
  const loadStates = useCallback(() => loadData('state', setStates), [loadData]);
  const loadCities = useCallback(() => loadData('city', setCities), [loadData]);

  const loadAll = useCallback(() => {
    loadCountries();
    loadStates();
    loadCities();
  }, [loadCountries, loadStates, loadCities]);

  const reload = useCallback((type) => {
    if (type === 'country') {
      loadCountries();
      loadStates();
      loadCities();
    } else if (type === 'state') {
      loadStates();
      loadCities();
    } else if (type === 'city') {
      loadCities();
    } else {
      loadAll();
    }
  }, [loadCountries, loadStates, loadCities, loadAll]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const locationParts = useMemo(() => {
    if (!filters.location) return { country: null, state: null, city: null };

    const parts = (filters.location.label || '').split(' > ').map(p => p.trim());

    if (filters.location.type === 'country') return { country: parts[0], state: null, city: null };
    if (filters.location.type === 'state') return { country: parts[0], state: parts[1], city: null };
    if (filters.location.type === 'city') return { country: parts[0], state: parts[1], city: parts[2] };

    return { country: null, state: null, city: null };
  }, [filters.location]);

  const filteredCountries = useMemo(() => {
    let result = countries || [];

    if (filters.term) {
      const q = filters.term.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(c => c.name === locationParts.country);

    return result;
  }, [countries, filters.term, locationParts]);

  const filteredStates = useMemo(() => {
    let result = states || [];

    if (filters.term) {
      const q = filters.term.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(s => s.countryName === locationParts.country);
    if (locationParts.state) result = result.filter(s => s.name === locationParts.state);

    return result;
  }, [states, filters.term, locationParts]);

  const filteredCities = useMemo(() => {
    let result = cities || [];

    if (filters.term) {
      const q = filters.term.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(c => c.countryName === locationParts.country);
    if (locationParts.state) result = result.filter(c => c.stateName === locationParts.state);
    if (locationParts.city) result = result.filter(c => c.name === locationParts.city);

    return result;
  }, [cities, filters.term, locationParts]);

  return {
    allCountries: countries,
    allStates: states,
    filteredCountries,
    filteredStates,
    filteredCities,
    loading,
    reload,
    filters,
    setFilters
  };
}

export default useLocations;