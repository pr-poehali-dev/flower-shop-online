import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
};

type CartItem = Product & { quantity: number };

type Review = {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
};

const products: Product[] = [
  { id: 1, name: 'Нежный рассвет', category: 'Романтика', price: 3500, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', description: 'Букет из розовых пионов и белых роз', rating: 5 },
  { id: 2, name: 'Весенний сад', category: 'Весна', price: 2800, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', description: 'Яркие тюльпаны и нарциссы', rating: 5 },
  { id: 3, name: 'Бархатная роскошь', category: 'Премиум', price: 5500, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', description: 'Красные розы премиум класса', rating: 5 },
  { id: 4, name: 'Летняя мечта', category: 'Лето', price: 3200, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', description: 'Полевые цветы в нежной гамме', rating: 4 },
  { id: 5, name: 'Королевский сад', category: 'Премиум', price: 6800, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/efe4a806-c6e4-4995-b128-1e9895ed7e35.jpg', description: 'Орхидеи и экзотические цветы', rating: 5 },
  { id: 6, name: 'Утренняя свежесть', category: 'Романтика', price: 2500, image: 'https://cdn.poehali.dev/projects/dd4ef7dc-dc1d-4f12-a070-7b316a54f3af/files/085f3e2f-8b4e-438d-8484-cee707115e02.jpg', description: 'Белые хризантемы и эвкалипт', rating: 4 },
];

const reviews: Review[] = [
  { id: 1, author: 'Мария К.', rating: 5, text: 'Превосходное качество! Цветы свежие, доставка точно в срок. Букет "Нежный рассвет" произвёл фурор!', date: '15 октября 2024' },
  { id: 2, author: 'Дмитрий П.', rating: 5, text: 'Заказываю здесь уже второй раз. Всегда свежие цветы и красивая упаковка. Жена в восторге!', date: '10 октября 2024' },
  { id: 3, author: 'Анна С.', rating: 4, text: 'Очень красивый букет, единственное — хотелось бы больше вариантов упаковки. В целом рекомендую!', date: '5 октября 2024' },
];

const API_URL = 'https://functions.poehali.dev/e9c48f9b-ae9b-49d1-9d68-7d2a8eef5910';

export default function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryType, setDeliveryType] = useState<'courier' | 'pickup'>('courier');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [cardComment, setCardComment] = useState('');
  const { toast } = useToast();

  const categories = ['Все', 'Романтика', 'Весна', 'Лето', 'Премиум'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDbProducts(data);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить товары',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'Все' 
    ? dbProducts 
    : dbProducts.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({
      title: 'Добавлено в корзину',
      description: `${product.name} добавлен в вашу корзину`,
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerEmail,
        deliveryType,
        deliveryDate,
        deliveryTime,
        deliveryAddress,
        paymentMethod,
        cardComment,
        totalAmount: cartTotal,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch('https://functions.poehali.dev/62287563-1454-422a-8ba8-e4d522a8e761', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      toast({
        title: 'Заказ успешно оформлен!',
        description: 'Мы свяжемся с вами в ближайшее время',
      });

      setCart([]);
      setIsOrderDialogOpen(false);
      setIsCartOpen(false);
      
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setDeliveryType('courier');
      setDeliveryDate('');
      setDeliveryTime('');
      setDeliveryAddress('');
      setPaymentMethod('card');
      setCardComment('');
    } catch (error) {
      toast({
        title: 'Ошибка оформления заказа',
        description: 'Попробуйте еще раз позже',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Flower2" className="text-primary" size={32} />
            <h1 className="text-3xl font-bold text-primary">Цветочная лавка</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#catalog" className="text-foreground hover:text-primary transition-colors">Каталог</a>
            <a href="#delivery" className="text-foreground hover:text-primary transition-colors">Доставка</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">О нас</a>
            <a href="#reviews" className="text-foreground hover:text-primary transition-colors">Отзывы</a>
            <a href="#contacts" className="text-foreground hover:text-primary transition-colors">Контакты</a>
          </nav>
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Icon name="ShoppingCart" size={20} />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Корзина</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full py-6">
                {cart.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Icon name="ShoppingBag" size={64} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Ваша корзина пуста</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-auto space-y-4">
                      {cart.map(item => (
                        <Card key={item.id}>
                          <CardContent className="p-4 flex gap-4">
                            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.price} ₽</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Icon name="Minus" size={16} />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Icon name="Plus" size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-auto"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Итого:</span>
                        <span>{cartTotal} ₽</span>
                      </div>
                      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full" size="lg">
                            Оформить заказ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Оформление заказа</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmitOrder} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Имя</Label>
                                <Input 
                                  id="name" 
                                  placeholder="Ваше имя" 
                                  value={customerName}
                                  onChange={(e) => setCustomerName(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input 
                                  id="phone" 
                                  placeholder="+7 (___) ___-__-__" 
                                  value={customerPhone}
                                  onChange={(e) => setCustomerPhone(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                placeholder="example@mail.ru" 
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Способ доставки</Label>
                              <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as 'courier' | 'pickup')}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="courier" id="courier" />
                                  <Label htmlFor="courier" className="cursor-pointer">Курьером</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="pickup" id="pickup" />
                                  <Label htmlFor="pickup" className="cursor-pointer">Самовывоз</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Адрес доставки</Label>
                              <Input 
                                id="address" 
                                placeholder="Улица, дом, квартира" 
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="date">Дата доставки</Label>
                              <Input 
                                id="date" 
                                type="date" 
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="time">Время доставки</Label>
                              <Select value={deliveryTime} onValueChange={setDeliveryTime} required>
                                <SelectTrigger id="time">
                                  <SelectValue placeholder="Выберите время" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="9:00-12:00">9:00 - 12:00</SelectItem>
                                  <SelectItem value="12:00-15:00">12:00 - 15:00</SelectItem>
                                  <SelectItem value="15:00-18:00">15:00 - 18:00</SelectItem>
                                  <SelectItem value="18:00-21:00">18:00 - 21:00</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Способ оплаты</Label>
                              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'sbp')}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card" className="cursor-pointer">Банковская карта</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sbp" id="sbp" />
                                  <Label htmlFor="sbp" className="cursor-pointer">СБП (Система быстрых платежей)</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="comment">Комментарий к заказу</Label>
                              <Textarea 
                                id="comment" 
                                placeholder="Пожелания по оформлению, текст открытки..." 
                                value={cardComment}
                                onChange={(e) => setCardComment(e.target.value)}
                              />
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                              <h4 className="font-semibold mb-2">Ваш заказ:</h4>
                              {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm mb-1">
                                  <span>{item.name} × {item.quantity}</span>
                                  <span>{item.price * item.quantity} ₽</span>
                                </div>
                              ))}
                              <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                                <span>Итого:</span>
                                <span>{cartTotal} ₽</span>
                              </div>
                            </div>
                            <Button type="submit" className="w-full" size="lg">
                              Подтвердить заказ
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-primary/30" />
        <img 
          src="/placeholder.svg" 
          alt="Цветы" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 text-center space-y-6 px-4 animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold text-foreground">
            Свежие цветы<br />с любовью
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Создаём букеты, которые дарят эмоции и радость каждый день
          </p>
          <Button size="lg" className="text-lg px-8" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
            Смотреть каталог
          </Button>
        </div>
      </section>

      <section id="catalog" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Наш каталог</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Выбирайте из нашей коллекции авторских букетов для любого случая
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="animate-scale-in"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <Badge className="absolute top-4 right-4">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon 
                        key={i} 
                        name="Star" 
                        size={16} 
                        className={i < product.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-2xl font-bold text-primary">{product.price} ₽</span>
                    <Button onClick={() => addToCart(product)}>
                      <Icon name="ShoppingCart" size={18} className="mr-2" />
                      В корзину
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Доставка и оплата</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 animate-fade-in">
              <Icon name="Truck" size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Быстрая доставка</h3>
              <p className="text-muted-foreground">
                Доставим ваш заказ в течение 3 часов по городу. Бесплатно от 3000 ₽
              </p>
            </Card>
            <Card className="text-center p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Icon name="CreditCard" size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Удобная оплата</h3>
              <p className="text-muted-foreground">
                Оплата картой онлайн или через СБП. Безопасно и быстро
              </p>
            </Card>
            <Card className="text-center p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Icon name="Sparkles" size={48} className="text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Свежесть гарантируем</h3>
              <p className="text-muted-foreground">
                Все цветы свежие, с фермерских плантаций. Гарантия 7 дней
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">О нашей мастерской</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Мы — команда флористов с 10-летним опытом создания уникальных цветочных композиций. 
                Каждый букет — это история, рассказанная языком цветов.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Работаем только со свежими цветами от проверенных поставщиков. Создаём авторские 
                композиции и воплощаем ваши индивидуальные пожелания.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">лет опыта</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">5000+</div>
                  <div className="text-sm text-muted-foreground">довольных клиентов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">свежие цветы</div>
                </div>
              </div>
            </div>
            <div className="animate-scale-in">
              <img 
                src="/placeholder.svg" 
                alt="О нас" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Отзывы клиентов</h2>
          <p className="text-center text-muted-foreground mb-12">
            Нам доверяют тысячи клиентов
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <Card key={review.id} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i} 
                      name="Star" 
                      size={18} 
                      className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{review.text}"</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{review.author}</span>
                  <span className="text-muted-foreground">{review.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Контакты</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="p-8 space-y-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <Icon name="MapPin" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Адрес</h3>
                  <p className="text-muted-foreground">г. Москва, ул. Цветочная, 15</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Phone" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Телефон</h3>
                  <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Mail" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">hello@flowers.ru</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Icon name="Clock" size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Режим работы</h3>
                  <p className="text-muted-foreground">Ежедневно с 9:00 до 21:00</p>
                </div>
              </div>
            </Card>
            <Card className="p-8 animate-scale-in">
              <h3 className="text-xl font-semibold mb-4">Напишите нам</h3>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="contact-name">Ваше имя</Label>
                  <Input id="contact-name" placeholder="Имя" />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Телефон</Label>
                  <Input id="contact-phone" placeholder="+7 (___) ___-__-__" />
                </div>
                <div>
                  <Label htmlFor="contact-message">Сообщение</Label>
                  <Textarea id="contact-message" placeholder="Ваше сообщение..." rows={4} />
                </div>
                <Button type="submit" className="w-full">
                  Отправить
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Flower2" size={32} />
            <h3 className="text-2xl font-bold">Цветочная лавка</h3>
          </div>
          <p className="text-background/70 mb-6">
            Создаём букеты с любовью с 2014 года
          </p>
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="hover:text-primary transition-colors">
              <Icon name="Instagram" size={24} />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Icon name="Facebook" size={24} />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Icon name="MessageCircle" size={24} />
            </a>
          </div>
          <p className="text-background/60 text-sm">
            © 2024 Цветочная лавка. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}