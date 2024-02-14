import React, { useCallback, useMemo, useState } from "react";
import * as Styled from "./styles";

import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { center } from "../../modules/tracking/utils/center";
import DriverContent from "../DriverContent";
import SearchBox from "../../modules/tracking/components/SearchBox";
import CustomMarker from "../../modules/tracking/components/CustomMarker";
import { iconSettings } from "../../modules/tracking/utils/iconSettings ";

const Map: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map>();
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox>();
  const [searchBoxB, setSearchBoxB] = useState<google.maps.places.SearchBox>();

  const [pointA, setPointA] = useState<google.maps.LatLngLiteral>();
  const [pointB, setPointB] = useState<google.maps.LatLngLiteral>();

  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] =
    useState<google.maps.LatLngLiteral | null>(null);

  // armazenmanto de direções
  const [response, setSResponse] =
    useState<google.maps.DistanceMatrixResponse | null>(null);

  const handleCancel = (): void => {
    setOrigin(null);
    setDestination(null);
    setSResponse(null);
  };

  //Referencias de mapas
  const onLoad = (ref: google.maps.places.SearchBox): void => {
    setSearchBox(ref);
  };

  const onLoadB = (ref: google.maps.places.SearchBox): void => {
    setSearchBoxB(ref);
  };

  //carrega as referencia de mapa
  const onMapLoad = (map: google.maps.Map): void => {
    setMap(map);
  };

  //  pegamos lat e lng pra criar novo objeto de localização, apontando para o novo local e centralizando
  const onPlacesChanged = (): void => {
    const places = searchBox!.getPlaces();
    console.log(places);
    const place = places![0];
    const location = {
      lat: place?.geometry?.location?.lat() || 0,
      lng: place?.geometry?.location?.lng() || 0,
    };
    //limpar input para novas pesquisas
    setPointA(location);
    setOrigin(null);
    setDestination(null);
    setSResponse(null);
    map?.panTo(location);
  };

  const onPlacesChangedB = (): void => {
    const places = searchBoxB!.getPlaces();
    console.log(places);
    const place = places![0];
    const location = {
      lat: place?.geometry?.location?.lat() || 0,
      lng: place?.geometry?.location?.lng() || 0,
    };

    setPointB(location);
    setOrigin(null);
    setDestination(null);
    setSResponse(null);
    map?.panTo(location);
  };

  //Função para traçar a rota
  const traceRoute = (): void => {
    if (pointA && pointB) {
      setOrigin(pointA);
      setDestination(pointB);
    }
  };

  //Função de direction (useMemo para renderizar apenas quando o destino se alterar)
  //@ts-ignore
  const directOptions = React.useMemo<google.maps.DirectionsRequest>(() => {
    return {
      origin,
      destination,
      travelMode: "DRIVING",
    };
  }, [origin, destination]);

  //@ts-ignore
  //Receber resp da api de directions
  const directionsCallback = useCallback((res) => {
    if (res !== null && res.status === "OK") {
      setSResponse(res);
    } else {
      console.log("deu ruiim", res);
    }
  }, []);

  //renderização de rota
  const directionRender = useMemo<any>(() => {
    return {
      directions: response,
    };
  }, [response]);

  return (
    <Styled.Container>
      <LoadScript
        googleMapsApiKey="AIzaSyDqdDpwqMa3_psd_DvvOdkNdVuXAe8tzVQ"
        libraries={["places"]}
      >
        <Styled.AppContainer>
          <GoogleMap
            onLoad={onMapLoad}
            center={center}
            zoom={15}
            options={{
              zoomControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
              keyboardShortcuts: false,
              streetViewControl: false,
            }}
            mapContainerStyle={{
              width: 395,
              height: 800,
              borderRadius: 7,
              marginLeft: 324,
            }}
          >
            <Styled.RequestContainer>
              <Styled.Bullet />

              <Styled.BulletB />
              <SearchBox
                onLoad={onLoad}
                onPlacesChanged={onPlacesChanged}
                placeholder="Minha Localização"
              />
              <SearchBox
                onLoad={onLoadB}
                onPlacesChanged={onPlacesChangedB}
                placeholder="Chamar cooperativa"
              />

              <Styled.Rota onClick={traceRoute}>Solicitar ReboqueX</Styled.Rota>

              {destination && (
                <>
                  <DriverContent />
                  <Styled.Cancel onClick={handleCancel}>
                    Cancelar ReboqueX
                  </Styled.Cancel>
                </>
              )}
            </Styled.RequestContainer>

            {!response && pointA && <Marker position={pointA} />}
            {!response && pointB && (
              <CustomMarker position={pointB} iconSettings={iconSettings} />
            )}

            {origin && destination && (
              <DirectionsService
                options={directOptions}
                callback={directionsCallback}
              />
            )}

            {response && directionRender && (
              <DirectionsRenderer options={directionRender} />
            )}
          </GoogleMap>
        </Styled.AppContainer>
      </LoadScript>
    </Styled.Container>
  );
};

export default Map;
