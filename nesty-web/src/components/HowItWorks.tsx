import { ClipboardList, Star, Send } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    title: 'אוספים מכל מקום',
    description: 'השתמשו בצ\'ק ליסט המובנה שלנו או הוסיפו מוצרים מכל חנות באינטרנט עם תוסף הכרום שלנו.',
    color: 'bg-primary',
  },
  {
    icon: Star,
    title: 'מסמנים את ה-Most Wanted',
    description: 'סמנו את הפריטים שאתם באמת חייבים כדי שהמשפחה והחברים ידעו מה הכי חשוב לכם.',
    color: 'bg-secondary',
  },
  {
    icon: Send,
    title: 'נותנים להם לעזור',
    description: 'שתפו את הרשימה בוואטסאפ, במייל או בכל מקום אחר. קבלו התראות כשמישהו קונה מתנה.',
    color: 'bg-accent-pink',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            איך זה עובד?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            שלושה צעדים פשוטים ואתם מוכנים לקבל את כל מה שאתם צריכים
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`${step.color} w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                <step.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div className="text-xs sm:text-sm font-medium text-primary mb-1 sm:mb-2">שלב {index + 1}</div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
