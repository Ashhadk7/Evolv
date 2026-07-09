// Country/state/city loading + dropdown option derivation for the sign-up wizard,
// extracted from SignUpForm.tsx.
"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES_STATES_URL, COUNTRY_CODES_URL, NO_REGION } from "../components/signup/constants";
import { buildCountries, fetchCities, findCountry, readJson } from "../components/signup/helpers";
import type {
  CityStatus,
  CountriesStatesResponse,
  CountryCodesResponse,
  CountryLocation,
  DropdownOption,
  LocationStatus,
} from "../components/signup/types";

export function useSignupLocationOptions(country: string, stateProvince: string) {
  const [countryOptions, setCountryOptions] = useState<CountryLocation[]>([]);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityStatus, setCityStatus] = useState<CityStatus>("idle");

  useEffect(() => {
    let active = true;

    async function loadCountries() {
      try {
        const [statesResponse, codesResponse] = await Promise.all([
          readJson<CountriesStatesResponse>(COUNTRIES_STATES_URL),
          readJson<CountryCodesResponse>(COUNTRY_CODES_URL),
        ]);
        if (!active) return;
        const nextCountries = buildCountries(statesResponse, codesResponse);
        if (!nextCountries.length) throw new Error("No country data returned.");
        setCountryOptions(nextCountries);
        setLocationStatus("ready");
      } catch {
        if (!active) return;
        setCountryOptions([]);
        setLocationStatus("error");
      }
    }

    loadCountries();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!country || !stateProvince) {
      Promise.resolve().then(() => {
        if (!active) return;
        setCityOptions([]);
        setCityStatus("idle");
      });
      return () => {
        active = false;
      };
    }

    Promise.resolve().then(async () => {
      try {
        setCityStatus("loading");
        const nextCities = await fetchCities(country, stateProvince);
        if (!active) return;
        setCityOptions(nextCities.length ? nextCities : [NO_REGION]);
        setCityStatus("ready");
      } catch {
        if (!active) return;
        setCityOptions([]);
        setCityStatus("error");
      }
    });

    return () => {
      active = false;
    };
  }, [country, stateProvince]);

  const selectedCountry = useMemo(
    () => findCountry(countryOptions, country),
    [country, countryOptions]
  );
  const countryDropdownOptions = useMemo<DropdownOption[]>(
    () =>
      countryOptions.map((option) => ({
        value: option.name,
        meta: option.dialCode || "Code unavailable",
      })),
    [countryOptions]
  );
  const stateDropdownOptions = useMemo<DropdownOption[]>(
    () => (selectedCountry?.states ?? []).map((state) => ({ value: state })),
    [selectedCountry]
  );
  const cityDropdownOptions = useMemo<DropdownOption[]>(
    () => cityOptions.map((city) => ({ value: city })),
    [cityOptions]
  );
  const countryCodeOptions = useMemo<DropdownOption[]>(
    () =>
      countryOptions
        .filter((option) => option.dialCode)
        .map((option) => ({ value: option.dialCode, label: option.name }))
        .sort((a, b) => a.label!.localeCompare(b.label!)),
    [countryOptions]
  );

  return {
    countryOptions,
    locationStatus,
    cityStatus,
    selectedCountry,
    countryDropdownOptions,
    stateDropdownOptions,
    cityDropdownOptions,
    countryCodeOptions,
  };
}
