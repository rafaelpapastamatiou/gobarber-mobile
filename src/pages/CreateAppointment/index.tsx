import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigation, useRoute } from "@react-navigation/native";

import Icon from "react-native-vector-icons/Feather";

import DateTimePicker from "@react-native-community/datetimepicker";

import { Alert, Platform } from "react-native";

import { format, parseISO } from "date-fns";

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from "./styles";

import { useAuth } from "../../hooks/auth";

import api from "../../services/api";

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();

  const { goBack, navigate } = useNavigation();

  const route = useRoute();

  const [providers, setProviders] = useState<Provider[]>([]);

  const routeParams = route.params as RouteParams;

  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedHour, setSelectedHour] = useState(0);

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);

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

  useEffect(() => {
    async function getProviderDayAvailability(): Promise<void> {
      try {
        const response = await api.get<AvailabilityItem[]>(
          `providers/${selectedProvider}/day-availability`,
          {
            params: {
              year: selectedDate.getFullYear(),
              month: selectedDate.getMonth() + 1,
              day: selectedDate.getDate(),
            },
          }
        );

        setAvailability(response.data);
        setSelectedHour(0);
      } catch (err) {
        console.log(err);
      }
    }

    getProviderDayAvailability();
  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((show) => !show);
  }, []);

  const handleDateChanged = useCallback(
    (event: any, date: Date | undefined) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }

      if (date) {
        setSelectedDate(date);
      }
    },
    []
  );

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    if (selectedHour && selectedHour !== 0) {
      try {
        const date = new Date(selectedDate);

        date.setHours(selectedHour);
        date.setMinutes(0);
        date.setSeconds(0);

        await api.post("appointments", {
          provider_id: selectedProvider,
          date,
        });

        navigate("AppointmentCreated", { date: date.getTime() });
      } catch (err) {
        console.log(err.response.data);
        Alert.alert(
          "Erro ao criar agendamento",
          "Ocorreu um erro ao tentar criar o agendamento, tente novamente."
        );
      }
    } else
      Alert.alert(
        "Selecione um horário",
        "Você precisa selecionar um horário desejado para criar o agendamento"
      );
  }, [navigate, selectedDate, selectedHour, selectedProvider]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00"),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), "HH:00"),
        };
      });
  }, [availability]);

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigateBack()}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>

      <Content>
        <ProvidersListContainer>
          <ProvidersList
            horizontal
            data={providers}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(provider) => provider.id}
            contentContainerStyle={{
              paddingTop: 32,
              paddingBottom: 32,
              paddingRight: 24,
              paddingLeft: 24,
            }}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                selected={selectedProvider === provider.id}
                onPress={() => handleSelectProvider(provider.id)}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
                <ProviderName selected={selectedProvider === provider.id}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>
        <Calendar>
          <Title>Escolha a data</Title>

          <OpenDatePickerButton onPress={() => handleToggleDatePicker()}>
            <OpenDatePickerButtonText>
              Selecionar outra data
            </OpenDatePickerButtonText>
          </OpenDatePickerButton>

          {showDatePicker && (
            <DateTimePicker
              {...(Platform.OS === "ios" && { textColor: "#f4ede8" })} // < nessa linha
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "spinner"}
              value={selectedDate}
              onChange={handleDateChanged}
            />
          )}
        </Calendar>

        <Schedule>
          <Title>Escolha o horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>
            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  onPress={() => handleSelectHour(hour)}
                  key={hourFormatted}
                  available={available}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>
            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    onPress={() => handleSelectHour(hour)}
                    key={hourFormatted}
                    available={available}
                  >
                    <HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                )
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
