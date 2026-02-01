import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Pakistani travel data...')

  // Clear existing data
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.package.deleteMany()
  await prisma.agency.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Cleared existing data')

  // Create Agencies
  const agencies = [
    { name: 'Hunza Travels', email: 'hunza@travels.com', phone: '+92-300-1234567', city: 'Hunza', country: 'Pakistan' },
    { name: 'Swat Adventures', email: 'swat@adventures.com', phone: '+92-300-1234568', city: 'Swat', country: 'Pakistan' },
    { name: 'Naran Tours', email: 'naran@tours.com', phone: '+92-300-1234569', city: 'Naran', country: 'Pakistan' },
    { name: 'Kashmir Valley Tours', email: 'kashmir@tours.com', phone: '+92-300-1234570', city: 'Muzaffarabad', country: 'Pakistan' },
    { name: 'Skardu Expeditions', email: 'skardu@expeditions.com', phone: '+92-300-1234571', city: 'Skardu', country: 'Pakistan' },
    { name: 'Northern Pakistan Travels', email: 'northern@travels.com', phone: '+92-300-1234572', city: 'Islamabad', country: 'Pakistan' },
    { name: 'Adventure Pakistan', email: 'adventure@pakistan.com', phone: '+92-300-1234573', city: 'Lahore', country: 'Pakistan' },
    { name: 'Family Travel Co', email: 'family@travel.com', phone: '+92-300-1234574', city: 'Karachi', country: 'Pakistan' },
    { name: 'Luxury Travel Pakistan', email: 'luxury@travel.com', phone: '+92-300-1234575', city: 'Islamabad', country: 'Pakistan' },
    { name: 'Budget Travel Pakistan', email: 'budget@travel.com', phone: '+92-300-1234576', city: 'Lahore', country: 'Pakistan' },
  ]

  const createdAgencies = []
  for (const agencyData of agencies) {
    const hashedPassword = await bcrypt.hash('agency123', 10)
    const user = await prisma.user.create({
      data: {
        email: agencyData.email,
        password: hashedPassword,
        name: agencyData.name,
        role: 'AGENCY',
        phone: agencyData.phone,
      },
    })

    const agency = await prisma.agency.create({
      data: {
        userId: user.id,
        agencyName: agencyData.name,
        contactEmail: agencyData.email,
        contactPhone: agencyData.phone,
        city: agencyData.city,
        country: agencyData.country,
        isVerified: true,
        isActive: true,
        rating: Math.random() * 1 + 4, // 4-5 rating
        totalReviews: Math.floor(Math.random() * 50),
      },
    })
    createdAgencies.push(agency)
  }
  console.log(`✅ Created ${createdAgencies.length} agencies`)

  // Create Tourist Users
  const tourists = []
  for (let i = 1; i <= 30; i++) {
    const hashedPassword = await bcrypt.hash('tourist123', 10)
    const user = await prisma.user.create({
      data: {
        email: `tourist${i}@example.com`,
        password: hashedPassword,
        name: `Tourist ${i}`,
        role: 'TOURIST',
        phone: `+92-300-${1000000 + i}`,
      },
    })
    tourists.push(user)
  }
  console.log(`✅ Created ${tourists.length} tourist users`)
  const createdTourists = tourists

  // Unique image sets for each package type (using Pexels for reliable images)
  const packageImageSets: Record<string, string[]> = {
    // Hunza Packages
    'Hunza Valley Adventure - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Hunza Valley Premium Tour - 3 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Hunza & Attabad Lake - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Complete Hunza Experience - 5 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Hunza Valley Deluxe - 2 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Hunza & Skardu Combo - 5 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Hunza Valley Budget Tour - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Swat Packages
    'Swat Valley Tour - 2 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Swat & Malam Jabba - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Swat & Kalam Adventure - 4 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Complete Swat Tour - 5 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Swat Family Package - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Naran-Kaghan Packages
    'Naran-Kaghan Tour - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Naran-Kaghan-Lulusar - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Complete Naran Experience - 4 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Naran-Kaghan-Saif-ul-Mulook - 5 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Naran Budget Package - 2 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Neelum Valley Packages
    'Neelum Valley Tour - 2 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Neelum & Sharda - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Complete Kashmir Tour - 5 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Neelum Valley Premium - 3 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Skardu Packages
    'Skardu Tour - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Skardu & Deosai - 4 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Skardu & Hunza - 6 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Skardu, Hunza & Fairy Meadows - 8 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Other Destinations
    'Murree & Nathia Gali - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Murree Weekend Getaway - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Chitral & Kalash Valley - 4 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Kumrat Valley Adventure - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Kumrat Valley Extended - 4 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Premium Packages
    'Luxury Hunza Experience - 5 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Premium Swat Retreat - 4 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Exclusive Skardu Tour - 6 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Family Packages
    'Family Hunza Tour - 3 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Family Swat Package - 3 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Family Naran Trip - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    
    // Adventure Packages
    'Hunza Trekking Adventure - 4 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Skardu Mountain Climbing - 5 Days': [
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Swat Hiking Tour - 3 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    // Budget Packages
    'Hunza Budget Explorer - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Swat Budget Explorer - 2 Days': [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Naran Budget Explorer - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    'Murree Budget Getaway - 2 Days': [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
  }

  // Destination-specific image pools (using high-quality images from Pexels and Unsplash)
  const destinationImages: Record<string, string[]> = {
    'Hunza': [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop', // Hunza Valley
      'https://images.unsplash.com/photo-1587832046620-4a78e5b6d50e?w=800&h=600&fit=crop', // Pakistan mountains
      'https://images.unsplash.com/photo-1596395823857-39b19f9ccff7?w=800&h=600&fit=crop', // Attabad Lake
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?w=800&h=600&fit=crop', // Mountain valley
      'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?w=800&h=600&fit=crop', // Snow mountains
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&h=600&fit=crop', // Karakoram Highway
    ],
    'Swat': [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop', // Swat Valley
      'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?w=800&h=600&fit=crop', // Green valley
      'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?w=800&h=600&fit=crop', // River valley
      'https://images.unsplash.com/photo-1567086420266-e6e6c4c75e90?w=800&h=600&fit=crop', // Pine forest
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?w=800&h=600&fit=crop', // Mountain landscape
      'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?w=800&h=600&fit=crop', // Valley view
    ],
    'Naran-Kaghan': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Mountain lake
      'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?w=800&h=600&fit=crop', // Alpine lake
      'https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg?w=800&h=600&fit=crop', // Mountain stream
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', // Mountain peak
      'https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?w=800&h=600&fit=crop', // Forest valley
      'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?w=800&h=600&fit=crop', // River view
    ],
    'Skardu': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Shangrila Lake
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?w=800&h=600&fit=crop', // Desert mountains
      'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg?w=800&h=600&fit=crop', // Rocky terrain
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Lake view
      'https://images.pexels.com/photos/2869499/pexels-photo-2869499.jpeg?w=800&h=600&fit=crop', // Mountain landscape
      'https://images.pexels.com/photos/3452356/pexels-photo-3452356.jpeg?w=800&h=600&fit=crop', // High altitude
    ],
    'Neelum Valley': [
      'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?w=800&h=600&fit=crop', // Green valley
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // River valley
      'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?w=800&h=600&fit=crop', // Lush greenery
      'https://images.pexels.com/photos/3532552/pexels-photo-3532552.jpeg?w=800&h=600&fit=crop', // Stream
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?w=800&h=600&fit=crop', // Mountains
      'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?w=800&h=600&fit=crop', // Valley panorama
    ],
    'Murree': [
      'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?w=800&h=600&fit=crop', // Hill station
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Pine hills
      'https://images.pexels.com/photos/3700731/pexels-photo-3700731.jpeg?w=800&h=600&fit=crop', // Forest path
      'https://images.pexels.com/photos/3772509/pexels-photo-3772509.jpeg?w=800&h=600&fit=crop', // Misty hills
      'https://images.pexels.com/photos/3779417/pexels-photo-3779417.jpeg?w=800&h=600&fit=crop', // Mountain resort
      'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?w=800&h=600&fit=crop', // Hill view
    ],
    'Chitral': [
      'https://images.pexels.com/photos/3914870/pexels-photo-3914870.jpeg?w=800&h=600&fit=crop', // Mountain valley
      'https://images.pexels.com/photos/3952048/pexels-photo-3952048.jpeg?w=800&h=600&fit=crop', // Remote mountains
      'https://images.pexels.com/photos/4090681/pexels-photo-4090681.jpeg?w=800&h=600&fit=crop', // High peaks
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Valley view
      'https://images.pexels.com/photos/4173624/pexels-photo-4173624.jpeg?w=800&h=600&fit=crop', // Mountain landscape
      'https://images.pexels.com/photos/4219610/pexels-photo-4219610.jpeg?w=800&h=600&fit=crop', // Scenic beauty
    ],
    'Kumrat Valley': [
      'https://images.pexels.com/photos/4246075/pexels-photo-4246075.jpeg?w=800&h=600&fit=crop', // Lush valley
      'https://images.pexels.com/photos/4321194/pexels-photo-4321194.jpeg?w=800&h=600&fit=crop', // Green meadows
      'https://images.pexels.com/photos/4327038/pexels-photo-4327038.jpeg?w=800&h=600&fit=crop', // Forest area
      'https://images.pexels.com/photos/4577720/pexels-photo-4577720.jpeg?w=800&h=600&fit=crop', // River flow
      'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?w=800&h=600&fit=crop', // Valley panorama
      'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?w=800&h=600&fit=crop', // Green landscape
    ],
    'Fairy Meadows': [
      'https://images.pexels.com/photos/4725133/pexels-photo-4725133.jpeg?w=800&h=600&fit=crop', // Alpine meadow
      'https://images.pexels.com/photos/4756093/pexels-photo-4756093.jpeg?w=800&h=600&fit=crop', // Nanga Parbat view
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Mountain meadow
      'https://images.pexels.com/photos/4825701/pexels-photo-4825701.jpeg?w=800&h=600&fit=crop', // High altitude
      'https://images.pexels.com/photos/5007263/pexels-photo-5007263.jpeg?w=800&h=600&fit=crop', // Mountain peak
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?w=800&h=600&fit=crop', // Scenic view
    ],
    'Kalam': [
      'https://images.pexels.com/photos/5273042/pexels-photo-5273042.jpeg?w=800&h=600&fit=crop', // Kalam valley
      'https://images.pexels.com/photos/5422207/pexels-photo-5422207.jpeg?w=800&h=600&fit=crop', // River valley
      'https://images.pexels.com/photos/5597367/pexels-photo-5597367.jpeg?w=800&h=600&fit=crop', // Forest view
      'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?w=800&h=600&fit=crop', // Green valley
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?w=800&h=600&fit=crop', // Mountain landscape
      'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?w=800&h=600&fit=crop', // Valley view
    ],
  }
  
  // Helper function to get destination-specific images with guaranteed non-empty results
  const getImagesForPackage = (title: string, destination: string, packageIndex: number, numImages: number = 3): string[] => {
    // Get the appropriate image pool for this destination
    const imagePool = destinationImages[destination] || destinationImages['Hunza']
    
    // Ensure we have images
    if (!imagePool || imagePool.length === 0) {
      console.warn(`⚠️ No images found for destination: ${destination}, using Hunza images`)
      const fallbackPool = destinationImages['Hunza']
      const images: string[] = []
      for (let i = 0; i < numImages; i++) {
        const imageIndex = (packageIndex * 3 + i) % fallbackPool.length
        images.push(fallbackPool[imageIndex])
      }
      return images
    }
    
    const images: string[] = []
    for (let i = 0; i < numImages; i++) {
      // Use packageIndex and i to get unique but consistent images for each package
      const imageIndex = (packageIndex * 3 + i) % imagePool.length
      images.push(imagePool[imageIndex])
    }
    
    // Final safety check - ensure we have at least 3 images
    if (images.length === 0 || images.some(img => !img || img.trim() === '')) {
      console.warn(`⚠️ Empty images detected for package: ${title}, using fallback`)
      return [
        'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?w=800&h=600&fit=crop',
        'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?w=800&h=600&fit=crop',
      ]
    }
    
    return images
  }

  // Create Packages - Expanded with budget options and diverse categories
  const packages = [
    // Budget Packages (5k-10k) - Hunza
    { title: 'Hunza Budget Explorer - 2 Days', destination: 'Hunza', duration: 2, price: 8000, agencyIndex: 0, originalPrice: 10000 },
    { title: 'Hunza Economy Tour - 2 Days', destination: 'Hunza', duration: 2, price: 7500, agencyIndex: 0 },
    { title: 'Hunza Value Package - 2 Days', destination: 'Hunza', duration: 2, price: 9000, agencyIndex: 0 },
    { title: 'Hunza Weekend Special - 2 Days', destination: 'Hunza', duration: 2, price: 8500, agencyIndex: 0 },
    
    // Budget Packages (5k-10k) - Swat
    { title: 'Swat Budget Explorer - 2 Days', destination: 'Swat', duration: 2, price: 7000, agencyIndex: 0 },
    { title: 'Swat Economy Tour - 2 Days', destination: 'Swat', duration: 2, price: 7500, agencyIndex: 0 },
    { title: 'Swat Value Package - 2 Days', destination: 'Swat', duration: 2, price: 8000, agencyIndex: 0 },
    
    // Budget Packages (5k-10k) - Naran
    { title: 'Naran Budget Explorer - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 6000, agencyIndex: 0 },
    { title: 'Naran Economy Tour - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 6500, agencyIndex: 0 },
    { title: 'Naran Value Package - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 7000, agencyIndex: 0 },
    { title: 'Naran Weekend Special - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 5500, agencyIndex: 0 },
    
    // Budget Packages (5k-10k) - Murree
    { title: 'Murree Budget Getaway - 2 Days', destination: 'Murree', duration: 2, price: 5000, agencyIndex: 0 },
    { title: 'Murree Economy Package - 2 Days', destination: 'Murree', duration: 2, price: 5500, agencyIndex: 0 },
    { title: 'Murree Value Tour - 2 Days', destination: 'Murree', duration: 2, price: 6000, agencyIndex: 0 },
    { title: 'Murree Weekend Escape - 2 Days', destination: 'Murree', duration: 2, price: 5800, agencyIndex: 0 },
    
    // Budget Packages (5k-10k) - Neelum
    { title: 'Neelum Budget Tour - 2 Days', destination: 'Neelum Valley', duration: 2, price: 7500, agencyIndex: 0 },
    { title: 'Neelum Economy Package - 2 Days', destination: 'Neelum Valley', duration: 2, price: 8000, agencyIndex: 0 },
    
    // Standard Hunza Packages
    { title: 'Hunza Valley Adventure - 2 Days', destination: 'Hunza', duration: 2, price: 18000, agencyIndex: 1, originalPrice: 20000 },
    { title: 'Hunza Valley Premium Tour - 3 Days', destination: 'Hunza', duration: 3, price: 28000, agencyIndex: 1, originalPrice: 32000 },
    { title: 'Hunza & Attabad Lake - 3 Days', destination: 'Hunza', duration: 3, price: 30000, agencyIndex: 1 },
    { title: 'Complete Hunza Experience - 5 Days', destination: 'Hunza', duration: 5, price: 55000, agencyIndex: 1, originalPrice: 65000 },
    { title: 'Hunza Valley Deluxe - 2 Days', destination: 'Hunza', duration: 2, price: 22000, agencyIndex: 1 },
    { title: 'Hunza & Skardu Combo - 5 Days', destination: 'Hunza', duration: 5, price: 60000, agencyIndex: 1 },
    { title: 'Hunza Valley Budget Tour - 2 Days', destination: 'Hunza', duration: 2, price: 15000, agencyIndex: 0 },
    { title: 'Hunza Cultural Tour - 3 Days', destination: 'Hunza', duration: 3, price: 25000, agencyIndex: 1 },
    { title: 'Hunza Photography Tour - 2 Days', destination: 'Hunza', duration: 2, price: 20000, agencyIndex: 1 },
    
    // Standard Swat Packages
    { title: 'Swat Valley Tour - 2 Days', destination: 'Swat', duration: 2, price: 15000, agencyIndex: 2 },
    { title: 'Swat & Malam Jabba - 3 Days', destination: 'Swat', duration: 3, price: 25000, agencyIndex: 2 },
    { title: 'Swat & Kalam Adventure - 4 Days', destination: 'Swat', duration: 4, price: 40000, agencyIndex: 2 },
    { title: 'Complete Swat Tour - 5 Days', destination: 'Swat', duration: 5, price: 50000, agencyIndex: 2 },
    { title: 'Swat Family Package - 3 Days', destination: 'Swat', duration: 3, price: 22000, agencyIndex: 2 },
    { title: 'Swat Nature Tour - 3 Days', destination: 'Swat', duration: 3, price: 24000, agencyIndex: 2 },
    { title: 'Swat Waterfalls Tour - 2 Days', destination: 'Swat', duration: 2, price: 18000, agencyIndex: 2 },
    
    // Standard Naran-Kaghan Packages
    { title: 'Naran-Kaghan Tour - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 12000, agencyIndex: 3 },
    { title: 'Naran-Kaghan-Lulusar - 3 Days', destination: 'Naran-Kaghan', duration: 3, price: 22000, agencyIndex: 3 },
    { title: 'Complete Naran Experience - 4 Days', destination: 'Naran-Kaghan', duration: 4, price: 35000, agencyIndex: 3 },
    { title: 'Naran-Kaghan-Saif-ul-Mulook - 5 Days', destination: 'Naran-Kaghan', duration: 5, price: 45000, agencyIndex: 3 },
    { title: 'Naran Budget Package - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 10000, agencyIndex: 3 },
    { title: 'Naran Lake Tour - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 14000, agencyIndex: 3 },
    { title: 'Naran Valley Explorer - 3 Days', destination: 'Naran-Kaghan', duration: 3, price: 26000, agencyIndex: 3 },
    
    // Standard Neelum Valley Packages
    { title: 'Neelum Valley Tour - 2 Days', destination: 'Neelum Valley', duration: 2, price: 15000, agencyIndex: 4 },
    { title: 'Neelum & Sharda - 3 Days', destination: 'Neelum Valley', duration: 3, price: 28000, agencyIndex: 4 },
    { title: 'Complete Kashmir Tour - 5 Days', destination: 'Neelum Valley', duration: 5, price: 48000, agencyIndex: 4 },
    { title: 'Neelum Valley Premium - 3 Days', destination: 'Neelum Valley', duration: 3, price: 30000, agencyIndex: 4 },
    { title: 'Neelum Scenic Tour - 2 Days', destination: 'Neelum Valley', duration: 2, price: 16000, agencyIndex: 4 },
    
    // Standard Skardu Packages
    { title: 'Skardu Tour - 3 Days', destination: 'Skardu', duration: 3, price: 38000, agencyIndex: 5 },
    { title: 'Skardu & Deosai - 4 Days', destination: 'Skardu', duration: 4, price: 52000, agencyIndex: 5 },
    { title: 'Skardu & Hunza - 6 Days', destination: 'Skardu', duration: 6, price: 75000, agencyIndex: 5 },
    { title: 'Skardu, Hunza & Fairy Meadows - 8 Days', destination: 'Skardu', duration: 8, price: 110000, agencyIndex: 5 },
    { title: 'Skardu Desert Tour - 3 Days', destination: 'Skardu', duration: 3, price: 40000, agencyIndex: 5 },
    { title: 'Skardu Lakes Tour - 4 Days', destination: 'Skardu', duration: 4, price: 55000, agencyIndex: 5 },
    
    // Other Destinations - Expanded
    { title: 'Murree & Nathia Gali - 2 Days', destination: 'Murree', duration: 2, price: 10000, agencyIndex: 6 },
    { title: 'Murree Weekend Getaway - 3 Days', destination: 'Murree', duration: 3, price: 15000, agencyIndex: 6 },
    { title: 'Murree Hill Station Tour - 2 Days', destination: 'Murree', duration: 2, price: 12000, agencyIndex: 6 },
    { title: 'Chitral & Kalash Valley - 4 Days', destination: 'Chitral', duration: 4, price: 50000, agencyIndex: 6 },
    { title: 'Chitral Cultural Tour - 3 Days', destination: 'Chitral', duration: 3, price: 40000, agencyIndex: 6 },
    { title: 'Kumrat Valley Adventure - 3 Days', destination: 'Kumrat Valley', duration: 3, price: 30000, agencyIndex: 6 },
    { title: 'Kumrat Valley Extended - 4 Days', destination: 'Kumrat Valley', duration: 4, price: 38000, agencyIndex: 6 },
    { title: 'Kumrat Waterfalls Tour - 2 Days', destination: 'Kumrat Valley', duration: 2, price: 20000, agencyIndex: 6 },
    { title: 'Fairy Meadows Base Camp - 3 Days', destination: 'Fairy Meadows', duration: 3, price: 35000, agencyIndex: 6 },
    { title: 'Fairy Meadows Trek - 4 Days', destination: 'Fairy Meadows', duration: 4, price: 45000, agencyIndex: 6 },
    { title: 'Kalam Valley Tour - 3 Days', destination: 'Kalam', duration: 3, price: 28000, agencyIndex: 6 },
    { title: 'Kalam & Ushu - 4 Days', destination: 'Kalam', duration: 4, price: 36000, agencyIndex: 6 },
    
    // Premium Packages
    { title: 'Luxury Hunza Experience - 5 Days', destination: 'Hunza', duration: 5, price: 85000, agencyIndex: 9 },
    { title: 'Premium Swat Retreat - 4 Days', destination: 'Swat', duration: 4, price: 65000, agencyIndex: 9 },
    { title: 'Exclusive Skardu Tour - 6 Days', destination: 'Skardu', duration: 6, price: 95000, agencyIndex: 9 },
    { title: 'Luxury Naran Experience - 4 Days', destination: 'Naran-Kaghan', duration: 4, price: 60000, agencyIndex: 9 },
    { title: 'Premium Neelum Valley - 5 Days', destination: 'Neelum Valley', duration: 5, price: 70000, agencyIndex: 9 },
    
    // Family Packages - Expanded
    { title: 'Family Hunza Tour - 3 Days', destination: 'Hunza', duration: 3, price: 25000, agencyIndex: 8 },
    { title: 'Family Swat Package - 3 Days', destination: 'Swat', duration: 3, price: 20000, agencyIndex: 8 },
    { title: 'Family Naran Trip - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 15000, agencyIndex: 8 },
    { title: 'Family Murree Getaway - 2 Days', destination: 'Murree', duration: 2, price: 12000, agencyIndex: 8 },
    { title: 'Family Skardu Tour - 4 Days', destination: 'Skardu', duration: 4, price: 45000, agencyIndex: 8 },
    { title: 'Family Neelum Trip - 3 Days', destination: 'Neelum Valley', duration: 3, price: 28000, agencyIndex: 8 },
    
    // Adventure Packages - Expanded
    { title: 'Hunza Trekking Adventure - 4 Days', destination: 'Hunza', duration: 4, price: 45000, agencyIndex: 7 },
    { title: 'Skardu Mountain Climbing - 5 Days', destination: 'Skardu', duration: 5, price: 70000, agencyIndex: 7 },
    { title: 'Swat Hiking Tour - 3 Days', destination: 'Swat', duration: 3, price: 28000, agencyIndex: 7 },
    { title: 'Naran Trekking Adventure - 3 Days', destination: 'Naran-Kaghan', duration: 3, price: 30000, agencyIndex: 7 },
    { title: 'Neelum Valley Trek - 4 Days', destination: 'Neelum Valley', duration: 4, price: 40000, agencyIndex: 7 },
    { title: 'Kumrat Adventure Trek - 3 Days', destination: 'Kumrat Valley', duration: 3, price: 32000, agencyIndex: 7 },
    
    // Weekend Packages
    { title: 'Weekend Hunza Escape - 2 Days', destination: 'Hunza', duration: 2, price: 18000, agencyIndex: 1 },
    { title: 'Weekend Swat Getaway - 2 Days', destination: 'Swat', duration: 2, price: 16000, agencyIndex: 2 },
    { title: 'Weekend Naran Trip - 2 Days', destination: 'Naran-Kaghan', duration: 2, price: 13000, agencyIndex: 3 },
    { title: 'Weekend Murree Escape - 2 Days', destination: 'Murree', duration: 2, price: 11000, agencyIndex: 6 },
  ]

  // Helper function to generate detailed includes based on package type
  const getPackageIncludes = (title: string, duration: number): string[] => {
    const includes: string[] = ['Hotel Accommodation', 'Breakfast', 'Transport', 'Professional Guide', 'Entry Tickets']
    
    // Add activities based on package title and duration
    const titleLower = title.toLowerCase()
    if (titleLower.includes('budget') || titleLower.includes('economy')) {
      includes.push('Basic Meals')
    } else if (titleLower.includes('luxury') || titleLower.includes('premium')) {
      includes.push('Lunch', 'Dinner', 'Bonfire Night', 'Cultural Show', 'Spa Access')
    } else if (titleLower.includes('family')) {
      includes.push('Lunch', 'Kids Activities', 'Family Bonfire', 'Entertainment')
    } else if (titleLower.includes('adventure') || titleLower.includes('trekking') || titleLower.includes('hiking')) {
      includes.push('Camping Equipment', 'Bonfire', 'BBQ Dinner', 'Adventure Guide')
    } else if (titleLower.includes('weekend')) {
      includes.push('Lunch', 'Evening Bonfire', 'BBQ Dinner')
    } else {
      // Standard packages
      if (duration >= 3) {
        includes.push('Lunch', 'Dinner', 'Bonfire Night')
      } else {
        includes.push('Lunch', 'Bonfire')
      }
    }
    
    return includes
  }

  const createdPackages = []
  let packageIndex = 0
  for (const pkgData of packages) {
    const agency = createdAgencies[pkgData.agencyIndex]
    const includes = getPackageIncludes(pkgData.title, pkgData.duration)
    
    // Generate detailed description with activities
    let description = `Experience the breathtaking beauty of ${pkgData.destination} with our ${pkgData.duration}-day package. `
    if (pkgData.duration === 2) {
      description += `Includes ${pkgData.duration} days of exploration with bonfire and lunch. `
    } else if (pkgData.duration >= 3) {
      description += `Enjoy ${pkgData.duration} days of adventure including bonfire nights, delicious meals, and guided tours. `
    }
    description += `Package includes hotel accommodation, meals, transport, professional guide, and entry tickets.`
    
    const packageImages = getImagesForPackage(pkgData.title, pkgData.destination, packageIndex)
    
    // Verify images are assigned
    if (!packageImages || packageImages.length === 0) {
      console.error(`❌ ERROR: No images for package #${packageIndex}: ${pkgData.title}`)
    }
    
    const package_ = await prisma.package.create({
      data: {
        agencyId: agency.id,
        title: pkgData.title,
        destination: pkgData.destination,
        description: description,
        duration: pkgData.duration,
        price: pkgData.price,
        originalPrice: pkgData.originalPrice || null,
        maxTravelers: 4,
        minTravelers: 1,
        includes: includes,
        excludes: ['Personal Expenses', 'Tips', 'Additional Activities'],
        itinerary: {
          day1: `Arrival and check-in at ${pkgData.destination}. Welcome lunch and evening bonfire.`,
          day2: `Sightseeing tour of ${pkgData.destination}. Lunch included.`,
          ...(pkgData.duration >= 3 ? { day3: `Continue exploration. Dinner and bonfire night.` } : {}),
          ...(pkgData.duration >= 4 ? { day4: `Additional activities and cultural experiences.` } : {}),
          ...(pkgData.duration >= 5 ? { day5: `Final day with farewell lunch and departure.` } : {}),
        },
        images: packageImages,
        rating: Math.random() * 1.5 + 3.5, // 3.5-5 rating
        totalBookings: Math.floor(Math.random() * 30),
        totalReviews: Math.floor(Math.random() * 20),
        isActive: true,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        cancellationPolicy: 'Free cancellation 7 days before travel date',
      },
    })
    createdPackages.push(package_)
    console.log(`✅ Package #${packageIndex}: ${pkgData.title} - ${packageImages.length} images`)
    packageIndex++
  }
  console.log(`✅ Created ${createdPackages.length} packages`)

  // Create Bookings
  const bookings = []
  for (let i = 0; i < 25; i++) {
    const tourist = createdTourists[Math.floor(Math.random() * createdTourists.length)]
    const package_ = createdPackages[Math.floor(Math.random() * createdPackages.length)]
    const agency = createdAgencies.find(a => a.id === package_.agencyId)!
    const travelers = Math.floor(Math.random() * 3) + 1
    const totalAmount = Number(package_.price) * travelers
    const bookingDate = new Date()
    bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30))

    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const booking = await prisma.booking.create({
      data: {
        userId: tourist.id,
        packageId: package_.id,
        agencyId: agency.id,
        travelers,
        totalAmount,
        bookingDate,
        status,
        paymentStatus: status === 'CONFIRMED' ? 'PAID' : 'PENDING',
        specialRequests: i % 3 === 0 ? 'Window seat preferred' : null,
      },
    })
    bookings.push(booking)
  }
  console.log(`✅ Created ${bookings.length} bookings`)

  // Create Reviews
  const reviews = []
  for (let i = 0; i < 20; i++) {
    const tourist = createdTourists[Math.floor(Math.random() * createdTourists.length)]
    const package_ = createdPackages[Math.floor(Math.random() * createdPackages.length)]
    const rating = Math.floor(Math.random() * 2) + 4 // 4-5 rating

    const review = await prisma.review.create({
      data: {
        userId: tourist.id,
        packageId: package_.id,
        rating,
        comment: `Amazing experience! ${package_.destination} is beautiful and the package was well-organized. Highly recommended!`,
        images: [],
        isVerified: true,
        helpfulCount: Math.floor(Math.random() * 10),
      },
    })
    reviews.push(review)
  }
  console.log(`✅ Created ${reviews.length} reviews`)

  // Create Notifications for Agencies
  for (const booking of bookings.slice(0, 10)) {
    const agency = createdAgencies.find(a => a.id === booking.agencyId)!
    await prisma.notification.create({
      data: {
        agencyId: agency.id,
        bookingId: booking.id,
        type: 'BOOKING_NEW',
        title: 'New Booking Received',
        message: `You have received a new booking for ${booking.travelers} traveler(s). Total amount: PKR ${booking.totalAmount}`,
        isRead: false,
        metadata: {
          bookingId: booking.id,
          packageId: booking.packageId,
        },
      },
    })
  }
  console.log('✅ Created notifications')

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
