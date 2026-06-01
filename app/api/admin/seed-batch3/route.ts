import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== 'agrihub-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Lazy initialization to avoid build-time errors
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get or create categories
  const { data: ppeCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'ppe-safety')
    .single()

  const { data: petCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'pet-supplies')
    .single()

  const { data: toolsCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'tools-hardware')
    .single()

  const ppeId = ppeCat?.id
  const petId = petCat?.id
  const toolsId = toolsCat?.id

  const products = [
    // Safety Caps/Hard Hats
    {
      name: 'Safety Cap + Lining Blue SABS',
      slug: 'safety-cap-lining-blue-sabs',
      description: 'SABS approved safety hard hat in blue with interior lining for comfort. Meets South African safety standards for head protection on construction sites and industrial environments.',
      short_description: 'SABS approved blue safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20BLUE%20SABS-aZzJDlWEqMYiKvkrON7p07Q1m437Ix.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-BLU-SABS'
    },
    {
      name: 'Safety Cap + Lining White SABS',
      slug: 'safety-cap-lining-white-sabs',
      description: 'SABS approved safety hard hat in white with interior lining for comfort. Ideal for supervisors and managers on construction sites.',
      short_description: 'SABS approved white safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20WHT%20SABS-rwqAnOY1OKQKCy6gYXqr1jYlFxD1QL.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-WHT-SABS'
    },
    {
      name: 'Safety Cap + Lining Red SABS',
      slug: 'safety-cap-lining-red-sabs',
      description: 'SABS approved safety hard hat in red with interior lining for comfort. High visibility color for safety officers.',
      short_description: 'SABS approved red safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20RED%20SABS-1fE2J5gSF3RzWMNrGQaDrFJLN1qf0d.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-RED-SABS'
    },
    {
      name: 'Safety Cap + Lining Yellow SABS',
      slug: 'safety-cap-lining-yellow-sabs',
      description: 'SABS approved safety hard hat in yellow with interior lining for comfort. High visibility standard construction color.',
      short_description: 'SABS approved yellow safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20YEL%20SABS-tQNeMwLBQpf9ejeqZdh7jee1YvdQ8f.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-YEL-SABS'
    },
    {
      name: 'Safety Cap + Lining Green SABS',
      slug: 'safety-cap-lining-green-sabs',
      description: 'SABS approved safety hard hat in green with interior lining for comfort. Often used for safety committee members.',
      short_description: 'SABS approved green safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20GREEN%20SABS-kLOZ8IZrj3V4zV8QACzimBYJlTKcSo.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-GRN-SABS'
    },
    {
      name: 'Safety Cap + Lining Grey SABS',
      slug: 'safety-cap-lining-grey-sabs',
      description: 'SABS approved safety hard hat in grey with interior lining for comfort. Professional appearance for site visitors.',
      short_description: 'SABS approved grey safety hard hat with lining',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20CAP%20%2B%20LINING%20GREY%20SABS-96d1fofkFUtFjfsPXzcDVaao8clQgY.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'CAP-GRY-SABS'
    },
    {
      name: 'Skudo Safety Hard Hat Blue',
      slug: 'skudo-safety-hard-hat-blue',
      description: 'Skudo brand professional safety hard hat in blue. Durable construction with adjustable headband for secure fit.',
      short_description: 'Skudo brand blue safety hard hat',
      price: 95,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20SAFETY%20HARD%20HAT%20BLUE-zaaP42G0e8MzBTZVqOEJF6iQyLGncx.jpg',
      category_id: ppeId,
      stock_quantity: 40,
      sku: 'SKUDO-HAT-BLU'
    },
    // Safety Goggles
    {
      name: 'Skudo Safety Goggles Welding Flip Front',
      slug: 'skudo-safety-goggles-welding-flip-front',
      description: 'Professional welding goggles with flip-front design. Dark tinted lenses protect eyes from welding arc. Green frame with adjustable strap.',
      short_description: 'Welding goggles with flip-front dark lenses',
      price: 75,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20SAFETY%20GOGGLES%20WELDING%20FLIP%20FRONT-HAUDNaGtqq8WzwzuCDXEk4cyNvaobq.jpg',
      category_id: ppeId,
      stock_quantity: 30,
      sku: 'SKUDO-GOG-WELD'
    },
    {
      name: 'Skudo Safety Goggles Indirect Vent Anti Scratch',
      slug: 'skudo-safety-goggles-indirect-vent-anti-scratch',
      description: 'Clear safety goggles with indirect ventilation and anti-scratch coating. Provides full eye protection while preventing fogging.',
      short_description: 'Clear safety goggles with indirect vent',
      price: 45,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20SAFETY%20GOGGLES%20INDIRECT%20VENT%20ANTI%20SCRATCHSKU-IAh3XOxilrApOhQRl7tEot6ISAo4YJ.jpg',
      category_id: ppeId,
      stock_quantity: 40,
      sku: 'SKUDO-GOG-IND'
    },
    {
      name: 'Skudo Safety Goggles Direct Vent Anti Scratch',
      slug: 'skudo-safety-goggles-direct-vent-anti-scratch',
      description: 'Clear safety goggles with direct ventilation and anti-scratch coating. Maximum airflow while maintaining eye protection.',
      short_description: 'Clear safety goggles with direct vent',
      price: 40,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20SAFETY%20GOGGLES%20DIRECT%20VENT%20ANTI%20SCRATCH-lv65B0KK3jahQJv7QsWE1v1iarxgcT.jpg',
      category_id: ppeId,
      stock_quantity: 40,
      sku: 'SKUDO-GOG-DIR'
    },
    {
      name: 'Safety Spectacles Sporty Cool Clear Lime',
      slug: 'safety-spectacles-sporty-cool-clear-lime',
      description: 'Modern sporty design safety spectacles with clear lenses and lime green accents. Lightweight and comfortable for all-day wear.',
      short_description: 'Sporty clear safety glasses with lime accents',
      price: 35,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAFETY%20SPECTACLES%20SPORTY%20COOL%20CLEAR%20LIME-ThDp0MklFpdUyBURB1PtKwSaxu4Rdg.jpg',
      category_id: ppeId,
      stock_quantity: 50,
      sku: 'SPEC-SPORT-LIME'
    },
    // Respirator
    {
      name: 'Skudo Respirator Balboa Single',
      slug: 'skudo-respirator-balboa-single',
      description: 'Single cartridge respirator mask for dust and particle protection. Blue silicone face seal for comfort. Replaceable filter cartridge.',
      short_description: 'Single cartridge dust respirator mask',
      price: 95,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20RESPIRATIOR%20BALBOA%20SINGLE-mD87ftWxcZ31FKIvzDB5bcJ2k1fsxg.jpg',
      category_id: ppeId,
      stock_quantity: 25,
      sku: 'SKUDO-RESP-SGL'
    },
    // Gloves
    {
      name: 'Skudo Gloves Polka Dot Per Pair',
      slug: 'skudo-gloves-polka-dot-pair',
      description: 'Cotton work gloves with PVC polka dot grip pattern. Provides excellent grip for handling materials. Knitted wrist for secure fit.',
      short_description: 'Cotton gloves with polka dot grip',
      price: 25,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20GLOVES%20POLKA%20DOT%20PER%20PAIR-E7SAWjamlHM5jtxwD6Fx0Gw43Njxjs.jpg',
      category_id: ppeId,
      stock_quantity: 100,
      sku: 'SKUDO-GLV-POLK'
    },
    {
      name: 'Skudo Gloves A Grade Pigskin VIP Elastic',
      slug: 'skudo-gloves-pigskin-vip-elastic',
      description: 'Premium A-grade pigskin leather gloves with elastic wrist. Soft and durable for precision work. Professional quality.',
      short_description: 'Premium pigskin leather work gloves',
      price: 85,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20GLOVES%20A%20GRADE%20PIGSKIN%20VIP%20ELASTIC-41ycAZY2zGOUUfQEjNdchMtokMWaoW.jpg',
      category_id: ppeId,
      stock_quantity: 40,
      sku: 'SKUDO-GLV-PIG'
    },
    {
      name: 'Skudo Gloves Welding Elbow 177.8mm',
      slug: 'skudo-gloves-welding-elbow',
      description: 'Heavy-duty green leather welding gloves with extended elbow length (177.8mm). Heat resistant for welding and metalwork applications.',
      short_description: 'Green leather elbow-length welding gloves',
      price: 120,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SKUDO%20GLOVES%20WELDING%20ELBOW%20177.8MM-NN78wVWWILhgr6DnOQ2AaPV5tjaf9h.jpg',
      category_id: ppeId,
      stock_quantity: 30,
      sku: 'SKUDO-GLV-WELD'
    },
    // Welding Rods
    {
      name: 'Promax E6013 Welding Rods 2.5mm x 5kg Box',
      slug: 'promax-e6013-welding-rods-2-5mm-5kg',
      description: 'Pro-Max E6013 general purpose welding electrodes. 2.5mm diameter, 5kg box. Made in South Africa. Excellent for all-position welding.',
      short_description: 'E6013 welding rods 2.5mm 5kg box',
      price: 265,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PROMAX%20E6013%20WELDING%20RODS%202.5MM%20X%205KG%20BOX-7IgvpiZHxRs04rH9APKFJJ0rmbbXqV.jpg',
      category_id: toolsId,
      stock_quantity: 20,
      sku: 'PROMAX-2.5-5KG'
    },
    {
      name: 'Promax E6013 Welding Rods 2.5mm x 1kg Box',
      slug: 'promax-e6013-welding-rods-2-5mm-1kg',
      description: 'Pro-Max E6013 general purpose welding electrodes. 2.5mm diameter, 1kg box. Perfect for small jobs and hobbyists.',
      short_description: 'E6013 welding rods 2.5mm 1kg box',
      price: 65,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PROMAX%20E6013%20WELDING%20RODS%202.5MM%20X%201KG%20BOX-uX2EJxRJthNQyCCeQRoXpIvehBc5s9.jpg',
      category_id: toolsId,
      stock_quantity: 30,
      sku: 'PROMAX-2.5-1KG'
    },
    // Pet Food
    {
      name: 'Pedigree Dog Food Adult Small Chicken 1.75kg',
      slug: 'pedigree-dog-food-adult-small-chicken-1-75kg',
      description: 'Pedigree Vital Protection dry dog food for small adult dogs (+12 months). Chicken flavour with essential nutrients for healthy skin, coat, and digestion.',
      short_description: 'Pedigree adult small dog food chicken 1.75kg',
      price: 145,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PEDIGREE%20DOG%20FOOD%20ADULT%20SMALL%20CHICKEN%201.75KG-s3ebjs7BF1fOl0qecFrl7a5AmzZzjr.jpg',
      category_id: petId,
      stock_quantity: 25,
      sku: 'PED-ADT-SM-1.75'
    },
    {
      name: 'Pedigree Dog Food Puppy Small/Med Chicken Rice 1.5kg',
      slug: 'pedigree-dog-food-puppy-small-med-chicken-rice-1-5kg',
      description: 'Pedigree complete puppy food for small to medium breeds (1-12 months). Chicken and rice formula for 100% complete nutrition and healthy development.',
      short_description: 'Pedigree puppy food chicken & rice 1.5kg',
      price: 135,
      image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PEDIGREE%20DOG%20FOOD%20PUPPY%20SML%20MED%20CHICKEN%20RICE%201.5KG-5uodxKI4NAG3ZtvUaDARCrx3Me2F7B.jpg',
      category_id: petId,
      stock_quantity: 25,
      sku: 'PED-PUP-SM-1.5'
    }
  ]

  const results = []
  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        ...product,
        is_active: true,
        is_featured: false,
        is_new: true,
        low_stock_threshold: 5
      }, { onConflict: 'slug' })
      .select()

    if (error) {
      results.push({ name: product.name, error: error.message })
    } else {
      results.push({ name: product.name, success: true })
    }
  }

  return NextResponse.json({ 
    message: `Processed ${products.length} products`,
    results 
  })
}
