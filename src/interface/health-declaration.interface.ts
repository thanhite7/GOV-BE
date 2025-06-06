export interface HealthDeclarationInput {
  name: string;
  temperature: number;
  symptoms: string[];
  contactWithInfected: boolean;
}