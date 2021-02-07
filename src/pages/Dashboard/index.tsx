import React, { useCallback, useEffect, useState } from "react";
import { View, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";

import { useAuth } from "../../hooks/auth";

import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
  ProvidersListTitle,
} from "./styles";

import api from "../../services/api";

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { navigate } = useNavigation();

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    async function loadProviders(): Promise<void> {
      try {
        const response = await api.get<Provider[]>("/providers");

        setProviders(response.data);
      } catch (err) {
        console.log(err);
      }
    }

    loadProviders();
  }, []);

  const navigateToProfile = useCallback(() => {
    navigate("Profile");
  }, [navigate]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate("CreateAppointment", { providerId });
    },
    [navigate]
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo,
          {"\n"}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatar_url }} />
        </ProfileButton>
      </Header>

      <ProvidersList
        data={providers}
        keyExtractor={(provider) => provider.id}
        contentContainerStyle={{
          paddingTop: 24,
          paddingRight: 16,
          paddingLeft: 16,
        }}
        ListHeaderComponent={
          <ProvidersListTitle>Cabeleireiros</ProvidersListTitle>
        }
        renderItem={({ item: provider }) => (
          <ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            <ProviderAvatar source={{ uri: provider.avatar_url }} />
            <ProviderInfo>
              <ProviderName>{provider.name}</ProviderName>

              <ProviderMeta>
                <Icon name="calendar" size={14} color="#ff9000" />
                <ProviderMetaText>Segunda à sexta</ProviderMetaText>
              </ProviderMeta>

              <ProviderMeta>
                <Icon name="clock" size={14} color="#ff9000" />
                <ProviderMetaText>08:00 às 18:00</ProviderMetaText>
              </ProviderMeta>
            </ProviderInfo>
          </ProviderContainer>
        )}
      />
    </Container>
  );
};

export default Dashboard;
