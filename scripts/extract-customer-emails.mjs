#!/usr/bin/env node
/**
 * Extract customer email addresses from contacts.jsonl
 * Searches for all 14 customers by name/organization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known customer names from database
const CUSTOMERS = [
  { name: 'Beth Smith', search: ['Beth Smith', 'beth.smith'] },
  { name: 'Amy Deltoro', search: ['Amy Deltoro', 'Deltoro'] },
  { name: 'Cartwright Properties', search: ['Cartwright', 'Cartwright Properties'] },
  { name: 'Crystal Richardson', search: ['Crystal Richardson', 'Richardson'] },
  { name: 'Gannett', search: ['Gannett'] },
  { name: 'Georgia Eye Surgery ASC', search: ['Georgia Eye', 'Ashlee Thomas', 'athomas@georgiaeyeclinic'] },
  { name: 'GNS Surgery Center', search: ['GNS Surgery', 'April Brown', 'april.brown'] },
  { name: 'Joan Kent', search: ['Joan Kent', 'Kent'] },
  { name: 'Michelle Nguyen', search: ['Michelle Nguyen', 'Nguyen'] },
  { name: 'Robert Andrews', search: ['Robert Andrews', 'Andrews'] },
  { name: 'Sandi Turner', search: ['Sandi Turner', 'Turner'] },
  { name: 'Sheri Tifosi', search: ['Sheri Tifosi', 'Tifosi'] },
  { name: 'Todd Knight', search: ['Todd Knight', 'Knight'] },
  { name: 'Tonyia Brooks', search: ['Tonyia Brooks', 'tonyia.brooks'] }
];

console.log('📧 EXTRACTING CUSTOMER EMAIL ADDRESSES FROM CONTACTS.JSONL\n');
console.log('=' .repeat(80));

const contactsPath = path.join(__dirname, '..', 'contacts.jsonl');
const contacts = fs.readFileSync(contactsPath, 'utf-8').split('\n').filter(line => line.trim());

const foundCustomers = [];

for (const customer of CUSTOMERS) {
  let found = false;
  
  for (const line of contacts) {
    if (!line.trim()) continue;
    
    try {
      const contact = JSON.parse(line);
      
      // Check if any search term matches
      const searchText = JSON.stringify(contact).toLowerCase();
      const matchesSearch = customer.search.some(term => 
        searchText.includes(term.toLowerCase())
      );
      
      if (matchesSearch) {
        const email = contact['E-mail 1 - Value'] || 
                     contact['E-mail 2 - Value'] || 
                     contact['E-mail 3 - Value'] || null;
        
        const phone = contact['Phone 1 - Value'] || 
                     contact['Phone 2 - Value'] || 
                     contact['Phone 3 - Value'] || null;
        
        const org = contact['Organization Name'] || '';
        const firstName = contact['First Name'] || '';
        const lastName = contact['Last Name'] || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (email) {
          foundCustomers.push({
            customer: customer.name,
            email: email,
            phone: phone,
            organization: org,
            contactName: fullName || org,
            raw: contact
          });
          
          console.log(`✅ ${customer.name}`);
          console.log(`   Email: ${email}`);
          console.log(`   Phone: ${phone || 'N/A'}`);
          console.log(`   Org: ${org || fullName}`);
          console.log('');
          
          found = true;
          break;
        }
      }
    } catch (e) {
      // Skip malformed lines
    }
  }
  
  if (!found) {
    console.log(`⚠️  ${customer.name} - NOT FOUND`);
    console.log('');
  }
}

console.log('=' .repeat(80));
console.log(`\n📊 SUMMARY: Found ${foundCustomers.length}/14 customers with emails\n`);

// Generate SQL update statements
console.log('💾 SQL UPDATE STATEMENTS:\n');
console.log('```sql');
for (const customer of foundCustomers) {
  const email = customer.email.replace(/'/g, "''"); // Escape single quotes
  const phone = customer.phone ? customer.phone.replace(/'/g, "''") : null;
  
  console.log(`UPDATE customers SET email = '${email}'${phone ? `, phone = '${phone}'` : ''} WHERE company_name = '${customer.customer.replace(/'/g, "''")}';`);
}
console.log('```\n');

// Output JSON for script processing
const outputPath = path.join(__dirname, 'customer-emails.json');
fs.writeFileSync(outputPath, JSON.stringify(foundCustomers, null, 2));
console.log(`✅ Saved to: ${outputPath}\n`);
