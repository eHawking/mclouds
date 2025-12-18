import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, ThumbsUp, Filter, ChevronDown, ChevronLeft, ChevronRight, Server, Globe, Shield, Mail, Cloud, Database } from 'lucide-react'
import clsx from 'clsx'

// Name lists for generating reviews
const maleFirstNames = ['Ahmed', 'Hassan', 'Michael', 'David', 'James', 'Robert', 'John', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Raj', 'Amir', 'Mohammed', 'Ali', 'Omar', 'Yusuf', 'Ibrahim', 'Tariq', 'Karim', 'Rashid']
const femaleFirstNames = ['Sarah', 'Emily', 'Lisa', 'Amanda', 'Sophie', 'Jennifer', 'Jessica', 'Ashley', 'Samantha', 'Elizabeth', 'Michelle', 'Kimberly', 'Melissa', 'Stephanie', 'Nicole', 'Angela', 'Christina', 'Rebecca', 'Laura', 'Rachel', 'Katherine', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Dorothy', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Helen', 'Deborah', 'Brenda', 'Amy', 'Anna', 'Olivia', 'Emma', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Fatima', 'Aisha', 'Zainab', 'Nadia', 'Layla', 'Priya', 'Ananya', 'Mei', 'Yuki']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Khan', 'Patel', 'Singh', 'Kumar', 'Chen', 'Wang', 'Kim', 'Park', 'Tanaka', 'Suzuki']

const locations = ['New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Miami, USA', 'Seattle, USA', 'Boston, USA', 'Austin, USA', 'Denver, USA', 'San Francisco, USA', 'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Dublin, Ireland', 'Paris, France', 'Berlin, Germany', 'Munich, Germany', 'Amsterdam, Netherlands', 'Stockholm, Sweden', 'Oslo, Norway', 'Copenhagen, Denmark', 'Helsinki, Finland', 'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Singapore', 'Hong Kong', 'Tokyo, Japan', 'Seoul, South Korea', 'Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Dubai, UAE', 'Abu Dhabi, UAE', 'Dhaka, Bangladesh', 'Chittagong, Bangladesh', 'Karachi, Pakistan', 'Lagos, Nigeria', 'Cairo, Egypt', 'Johannesburg, South Africa', 'São Paulo, Brazil', 'Mexico City, Mexico', 'Buenos Aires, Argentina']

const roles = ['CEO', 'CTO', 'Founder', 'Co-Founder', 'Developer', 'Lead Developer', 'Senior Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'System Administrator', 'IT Director', 'IT Manager', 'Technical Lead', 'Project Manager', 'Product Manager', 'Marketing Director', 'Marketing Manager', 'Digital Marketer', 'SEO Specialist', 'Content Creator', 'Blogger', 'Influencer', 'E-commerce Owner', 'Online Store Owner', 'Business Owner', 'Entrepreneur', 'Startup Founder', 'Agency Owner', 'Web Designer', 'Graphic Designer', 'UX Designer', 'Freelancer', 'Consultant', 'Data Scientist', 'Game Developer', 'App Developer', 'Software Engineer', 'Security Analyst']

const services = [
  { name: 'VPS Hosting', icon: Server },
  { name: 'Cloud Server', icon: Cloud },
  { name: 'Dedicated Server', icon: Database },
  { name: 'Domain Registration', icon: Globe },
  { name: 'SSL Certificate', icon: Shield },
  { name: 'Professional Email', icon: Mail },
  { name: 'Website Backup', icon: Database },
  { name: 'Web Development', icon: Globe },
]


// Review templates - opening phrases
const reviewOpenings = {
  5: [
    'Absolutely love this service!', 'Best decision we ever made.', 'Cannot recommend enough!',
    'Exceeded all my expectations.', 'Phenomenal experience overall.', 'Top-notch in every way.',
    'This is exactly what we needed.', 'Outstanding from start to finish.', 'Incredible value.',
    'Simply amazing service.', 'Five stars is not enough!', 'Beyond impressed.',
  ],
  4: [
    'Very good service overall.', 'Mostly satisfied with my experience.', 'Good hosting choice.',
    'Happy with the service.', 'Solid performance.', 'Pretty good experience.',
    'Would recommend with minor caveats.', 'Good value for money.', 'Generally pleased.',
  ],
  3: [
    'It\'s an okay service.', 'Average experience overall.', 'Nothing special but works.',
    'Mixed feelings about this.', 'Decent but not outstanding.', 'Gets the job done.',
  ],
  2: [
    'Disappointed with the service.', 'Not what I expected.', 'Below my expectations.',
    'Having second thoughts.', 'Frustrated with the experience.', 'Not satisfied.',
  ],
  1: [
    'Terrible experience.', 'Avoid this service.', 'Complete disaster.', 'Worst hosting ever.',
  ]
}

// Review templates - middle content
const reviewMiddles = {
  5: [
    'The speed improvements are incredible - our site loads in under 1 second now.',
    'Support team responded within minutes and solved my issue immediately.',
    'Migration was seamless with zero downtime.',
    'The uptime has been 100% since we started.',
    'Our customers have noticed the speed difference.',
    'The control panel is intuitive and powerful.',
    'Security features are enterprise-grade.',
    'Scaling was effortless as our traffic grew.',
    'The NVMe storage makes everything blazing fast.',
    'Free SSL and daily backups included.',
    'Their team went above and beyond to help us.',
    'Performance is consistently excellent.',
  ],
  4: [
    'Performance is good, though the dashboard could be more intuitive.',
    'Support is helpful but response times vary.',
    'The servers are reliable with occasional minor hiccups.',
    'Good features, just wish there were more payment options.',
    'Migration had some bumps but ultimately successful.',
    'Documentation could be more comprehensive.',
  ],
  3: [
    'Servers work but nothing exceptional about the performance.',
    'Support responses are hit or miss.',
    'The interface feels a bit outdated.',
    'Some features are missing compared to competitors.',
    'Had some initial setup issues.',
    'Works for basic needs.',
  ],
  2: [
    'Multiple support tickets went unanswered.',
    'Speeds don\'t match what was advertised.',
    'Had unexpected downtime during peak hours.',
    'Support feels automated and unhelpful.',
    'Migration caused several problems.',
  ],
  1: [
    'Lost data and support was useless.',
    'Constant downtime with no explanation.',
    'Hidden fees everywhere.',
    'Billing issues and rude support.',
  ]
}

// Review templates - closing phrases
const reviewClosings = {
  5: [
    'Highly recommend to everyone!', 'Will continue using for years to come.',
    'Thank you for the excellent service!', 'Best investment for our business.',
    'Already recommended to colleagues.', 'Couldn\'t be happier.',
    'A game-changer for our online presence.', 'Worth every penny.',
  ],
  4: [
    'Would recommend with minor reservations.', 'Good choice for most users.',
    'Happy overall despite small issues.', 'Will likely continue using.',
  ],
  3: [
    'Might look at alternatives eventually.', 'Acceptable for the price.',
    'Not sure if I\'ll renew.', 'Could be better, could be worse.',
  ],
  2: [
    'Looking for alternatives now.', 'Cannot recommend at this time.',
    'Hope they improve.', 'Considering switching providers.',
  ],
  1: [
    'Stay away!', 'Never again.', 'Save yourself the trouble.', 'Complete waste of money.',
  ]
}

// Titles for each rating
const reviewTitlesByRating = {
  5: ['Absolutely amazing!', 'Best hosting ever!', 'Exceeded expectations', 'Highly recommend!', 'Perfect service', 'Outstanding!', 'Worth every penny', 'Simply the best', 'Incredible experience', 'Five stars!'],
  4: ['Very good overall', 'Solid choice', 'Good service', 'Mostly satisfied', 'Recommended', 'Good value'],
  3: ['Average experience', 'It\'s okay', 'Decent service', 'Mixed feelings', 'Nothing special'],
  2: ['Disappointed', 'Below expectations', 'Not satisfied', 'Needs improvement'],
  1: ['Terrible experience', 'Avoid!', 'Complete disaster', 'Very disappointed']
}

// Generate all 2847 reviews with unique names
const generateReviews = () => {
  const allReviews = []
  const totalReviews = 2847
  const usedNames = new Set()
  
  for (let i = 0; i < totalReviews; i++) {
    // Use index-based selection to ensure variety
    const genderIndex = i % 2
    const isFemale = genderIndex === 0
    const firstNames = isFemale ? femaleFirstNames : maleFirstNames
    
    // Use different indices for each property to ensure variety
    const firstNameIndex = (i * 7 + 3) % firstNames.length
    const lastNameIndex = (i * 11 + 5) % lastNames.length
    const firstName = firstNames[firstNameIndex]
    const lastName = lastNames[lastNameIndex]
    
    // Ensure unique names by adding suffix if needed
    let name = `${firstName} ${lastName}`
    let suffix = 1
    while (usedNames.has(name) && suffix < 100) {
      name = `${firstName} ${lastName}${suffix > 1 ? ' ' + String.fromCharCode(64 + suffix) : ''}`
      suffix++
    }
    usedNames.add(name)
    
    // Determine if review has image (70% have images)
    const hasImage = i % 10 < 7
    const photoIndex = ((i * 13) % 99) + 1 // 1-99
    const photoGender = isFemale ? 'women' : 'men'
    
    // Rating distribution: 92% 5-star, 8% 4-star
    const ratingMod = i % 100
    const rating = ratingMod < 92 ? 5 : 4
    
    // Generate unique review by combining opening + middle + closing with different indices
    const openings = reviewOpenings[rating]
    const middles = reviewMiddles[rating]
    const closings = reviewClosings[rating]
    const titles = reviewTitlesByRating[rating]
    
    // Use prime multipliers to create unique combinations
    const openIdx = (i * 7) % openings.length
    const midIdx = (i * 11) % middles.length
    const closeIdx = (i * 13) % closings.length
    const titleIdx = (i * 17) % titles.length
    
    const reviewText = `${openings[openIdx]} ${middles[midIdx]} ${closings[closeIdx]}`
    const reviewTitle = titles[titleIdx]
    
    // Generate date (spread over last 2 years)
    const daysAgo = (i * 17) % 730
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]
    
    // Select service, role, location using different multipliers
    const serviceIndex = (i * 3) % services.length
    const roleIndex = (i * 5) % roles.length
    const locationIndex = (i * 7) % locations.length
    
    const service = services[serviceIndex]
    
    allReviews.push({
      id: i + 1,
      name,
      role: roles[roleIndex],
      location: locations[locationIndex],
      rating,
      date: dateStr,
      title: reviewTitle,
      review: reviewText,
      img: hasImage ? `https://randomuser.me/api/portraits/${photoGender}/${photoIndex}.jpg` : null,
      initial: !hasImage ? `${firstName[0]}${lastName[0]}` : null,
      verified: rating >= 4 ? (i % 20 !== 0) : (i % 5 === 0), // Higher ratings more likely verified
      helpful: ((i * 37) % 300) + 1,
      service: service.name,
      serviceIcon: service.icon
    })
  }
  
  // Sort by date (most recent first)
  return allReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const reviews = generateReviews()

const stats = {
  total: 2847,
  average: 4.9,
  distribution: [
    { stars: 5, count: 2619, percentage: 92 },
    { stars: 4, count: 228, percentage: 8 }
  ]
}

const REVIEWS_PER_PAGE = 12

export default function Reviews() {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [helpfulClicks, setHelpfulClicks] = useState({})
  const [currentPage, setCurrentPage] = useState(1)

  const handleHelpful = (reviewId) => {
    setHelpfulClicks(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const filteredReviews = useMemo(() => {
    return reviews
      .filter(r => filter === 'all' || r.rating === parseInt(filter))
      .sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.date) - new Date(a.date)
        if (sortBy === 'helpful') return b.helpful - a.helpful
        if (sortBy === 'highest') return b.rating - a.rating
        return 0
      })
  }, [filter, sortBy])

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE)

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-500/10 via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display">
              Customer <span className="text-gradient">Reviews</span>
            </h1>
            <p className="mt-4 text-xl text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
              See what our customers say about their experience with Magnetic Clouds
            </p>

            {/* Overall Rating */}
            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="mt-2 text-3xl font-bold">{stats.average}/5</p>
              <p className="text-dark-500">Based on {stats.total.toLocaleString()} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="mt-8 max-w-md mx-auto space-y-2">
              {stats.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-dark-500">{item.stars}★</span>
                  <div className="flex-1 h-3 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: (5 - item.stars) * 0.1 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                    />
                  </div>
                  <span className="w-12 text-sm text-dark-500 text-right">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-dark-200 dark:border-dark-800 sticky top-16 bg-white/90 dark:bg-dark-950/90 backdrop-blur-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-dark-500" />
              <span className="text-sm font-medium">Filter:</span>
              <div className="flex gap-2">
                {['all', '5', '4'].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={clsx(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      filter === f
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700'
                    )}
                  >
                    {f === 'all' ? 'All' : `${f}★`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-dark-100 dark:bg-dark-800 px-4 py-1.5 pr-8 rounded-lg text-sm cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                  <option value="highest">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section id="reviews-grid" className="py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-dark-200 dark:border-dark-700 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {review.img ? (
                      <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      review.initial
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{review.name}</h3>
                      {review.verified && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-500 truncate">{review.role}</p>
                    <p className="text-xs text-dark-400">{review.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={clsx(
                          'w-4 h-4',
                          star <= review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-dark-300'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-dark-400">
                    {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Service Purchased */}
                {review.service && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium">
                    {review.serviceIcon && <review.serviceIcon className="w-3.5 h-3.5" />}
                    {review.service}
                  </div>
                )}

                {/* Content */}
                <h4 className="mt-3 font-semibold text-dark-900 dark:text-white">
                  {review.title}
                </h4>
                <p className="mt-2 text-dark-600 dark:text-dark-400 text-sm leading-relaxed">
                  {review.review}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                  <button 
                    onClick={() => handleHelpful(review.id)}
                    className={clsx(
                      "flex items-center gap-2 text-sm transition-colors",
                      helpfulClicks[review.id] 
                        ? "text-primary-500" 
                        : "text-dark-500 hover:text-primary-500"
                    )}
                  >
                    <ThumbsUp className={clsx("w-4 h-4", helpfulClicks[review.id] && "fill-primary-500")} />
                    Helpful ({review.helpful + (helpfulClicks[review.id] ? 1 : 0)})
                  </button>
                  <Quote className="w-5 h-5 text-dark-300" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-sm text-dark-500">
                Showing {startIndex + 1}-{Math.min(startIndex + REVIEWS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length.toLocaleString()} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {currentPage > 3 && (
                    <>
                      <button onClick={() => { setCurrentPage(1); document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="px-3 py-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">1</button>
                      {currentPage > 4 && <span className="px-2 text-dark-400">...</span>}
                    </>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    if (pageNum < 1 || pageNum > totalPages) return null
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => { setCurrentPage(pageNum); document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg transition-colors",
                          currentPage === pageNum
                            ? "bg-primary-500 text-white"
                            : "hover:bg-dark-100 dark:hover:bg-dark-800"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-dark-400">...</span>}
                      <button onClick={() => { setCurrentPage(totalPages); document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="px-3 py-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800">{totalPages}</button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); document.getElementById('reviews-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-dark-100 dark:bg-dark-800 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display">Join Thousands of Happy Customers</h2>
          <p className="mt-4 text-lg text-white/80">
            Experience the Magnetic Clouds difference with our 30-day money-back guarantee.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/hosting" className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors">
              Get Started Today
            </a>
            <a href="/contact" className="border-2 border-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
