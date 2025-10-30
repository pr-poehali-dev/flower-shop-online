import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  delivery_time: string;
  total_amount: number;
  status: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
};

const API_URL = {
  products: 'https://functions.poehali.dev/e9c48f9b-ae9b-49d1-9d68-7d2a8eef5910',
  orders: 'https://functions.poehali.dev/62287563-1454-422a-8ba8-e4d522a8e761',
};

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Романтика',
    price: 0,
    image: '',
    description: '',
    rating: 5,
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    const response = await fetch(API_URL.products);
    const data = await response.json();
    setProducts(data);
  };

  const loadOrders = async () => {
    const response = await fetch(API_URL.orders);
    const data = await response.json();
    setOrders(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingProduct ? 'PUT' : 'POST';
    const body = editingProduct 
      ? { ...formData, id: editingProduct.id }
      : formData;

    const response = await fetch(API_URL.products, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      toast({
        title: editingProduct ? 'Товар обновлён' : 'Товар добавлен',
        description: 'Изменения сохранены',
      });
      loadProducts();
      setIsEditDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      rating: product.rating,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    const response = await fetch(API_URL.orders, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });

    if (response.ok) {
      toast({
        title: 'Статус заказа обновлён',
      });
      loadOrders();
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Романтика',
      price: 0,
      image: '',
      description: '',
      rating: 5,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-primary">Панель администратора</h1>
          <Button asChild variant="outline">
            <a href="/">
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              На сайт
            </a>
          </Button>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Товары</CardTitle>
              <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Plus" size={20} className="mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Редактировать товар' : 'Новый товар'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Категория</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Романтика">Романтика</SelectItem>
                          <SelectItem value="Весна">Весна</SelectItem>
                          <SelectItem value="Лето">Лето</SelectItem>
                          <SelectItem value="Премиум">Премиум</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Цена</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label>URL изображения</Label>
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Рейтинг</Label>
                      <Select value={String(formData.rating)} onValueChange={(value) => setFormData({ ...formData, rating: Number(value) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <SelectItem key={r} value={String(r)}>{r} звёзд</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category} • {product.price} ₽</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Icon name="Edit" size={16} className="mr-2" />
                      Редактировать
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Заказы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Заказ #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">{order.customer_name} • {order.customer_phone}</p>
                        <p className="text-sm text-muted-foreground">
                          Доставка: {new Date(order.delivery_date).toLocaleDateString('ru-RU')} {order.delivery_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.total_amount} ₽</p>
                        <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новый</SelectItem>
                            <SelectItem value="processing">В обработке</SelectItem>
                            <SelectItem value="delivering">Доставляется</SelectItem>
                            <SelectItem value="completed">Выполнен</SelectItem>
                            <SelectItem value="cancelled">Отменён</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Состав заказа:</p>
                      {order.items && order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {item.product_name} × {item.quantity} = {item.price * item.quantity} ₽
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
