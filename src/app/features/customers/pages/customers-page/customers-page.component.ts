import { Component, signal } from '@angular/core';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  purchasesCount: number;
  totalSpent: number;
  lastPurchase: string;
}

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss'
})
export class CustomersPageComponent {
  // Mock customer database for Lume
  customers = signal<Customer[]>([
    {
      id: 'c1',
      name: 'João Paulo Dev',
      email: 'joaopaulo@dev.com',
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      purchasesCount: 5,
      totalSpent: 1850.40,
      lastPurchase: '2026-07-09'
    },
    {
      id: 'c2',
      name: 'Maria Silva',
      email: 'maria.silva@gmail.com',
      phone: '(21) 99888-7766',
      cpf: '987.654.321-99',
      address: 'Rua das Flores, 123 - Rio de Janeiro/RJ',
      purchasesCount: 3,
      totalSpent: 2430.50,
      lastPurchase: '2026-07-09'
    },
    {
      id: 'c3',
      name: 'Carlos Santos',
      email: 'carlos.s@yahoo.com',
      phone: '(31) 98877-6655',
      cpf: '456.789.123-11',
      address: 'Av. Afonso Pena, 500 - Belo Horizonte/MG',
      purchasesCount: 1,
      totalSpent: 249.90,
      lastPurchase: '2026-07-08'
    },
    {
      id: 'c4',
      name: 'Ana Oliveira',
      email: 'ana.oliveira@outlook.com',
      phone: '(41) 97766-5544',
      cpf: '321.654.987-88',
      address: 'Rua XV de Novembro, 800 - Curitiba/PR',
      purchasesCount: 8,
      totalSpent: 4210.00,
      lastPurchase: '2026-07-07'
    }
  ]);
}
