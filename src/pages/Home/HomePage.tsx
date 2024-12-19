import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Space } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { orderAPI, userAPI } from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function HomePage() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        growthRate: 0,
        selectedPeriodRevenue: 0,
        comparisonPeriodRevenue: 0,
        selectedPeriodOrders: 0,
        comparisonPeriodOrders: 0
    });

    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'month').startOf('month'),
        dayjs().subtract(1, 'month').endOf('month')
    ]);

    const [comparisonRange, setComparisonRange] = useState([
        dayjs().subtract(2, 'month').startOf('month'),
        dayjs().subtract(2, 'month').endOf('month')
    ]);

    const calculateStats = async () => {
        try {
            const [orders, users] = await Promise.all([
                orderAPI.getOrders(),
                userAPI.getAllUsers()
            ]);

            // Seçilen dönem için siparişleri filtrele
            const selectedPeriodOrders = orders.filter((order: any) => {
                const orderDate = dayjs(order.createdAt);
                return orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
            });

            // Karşılaştırma dönemi için siparişleri filtrele
            const comparisonPeriodOrders = orders.filter((order: any) => {
                const orderDate = dayjs(order.createdAt);
                return orderDate.isAfter(comparisonRange[0]) && orderDate.isBefore(comparisonRange[1]);
            });

            // Ciroları hesapla
            const selectedPeriodRevenue = selectedPeriodOrders.reduce((sum: number, order: any) =>
                sum + (order.finalAmount || 0), 0);

            const comparisonPeriodRevenue = comparisonPeriodOrders.reduce((sum: number, order: any) =>
                sum + (order.finalAmount || 0), 0);

            // Büyüme oranını hesapla
            const revenueGrowth = comparisonPeriodRevenue === 0 ? 100 :
                ((selectedPeriodRevenue - comparisonPeriodRevenue) / comparisonPeriodRevenue) * 100;

            setStats({
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum: number, order: any) =>
                    sum + (order.finalAmount || 0), 0),
                totalCustomers: users.length,
                growthRate: Number(revenueGrowth.toFixed(1)),
                selectedPeriodRevenue,
                comparisonPeriodRevenue,
                selectedPeriodOrders: selectedPeriodOrders.length,
                comparisonPeriodOrders: comparisonPeriodOrders.length
            });
        } catch (error) {
            console.error('Stats yüklenirken hata:', error);
        }
    };

    useEffect(() => {
        calculateStats();
    }, [dateRange, comparisonRange]);

    return (
        <>
            <div className="p-6">
                <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <h4>Karşılaştırılacak Dönem:</h4>
                            <RangePicker
                                value={[dateRange[0], dateRange[1]]}
                                onChange={(dates) => dates && setDateRange(dates as any[])}
                                picker="month"
                            />
                        </Col>
                        <Col span={12}>
                            <h4>Karşılaştırma Dönemi:</h4>
                            <RangePicker
                                value={[comparisonRange[0], comparisonRange[1]]}
                                onChange={(dates) => dates && setComparisonRange(dates as any[])}
                                picker="month"
                            />
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title={`${dateRange[0].format('MMMM YYYY')} Cirosu`}
                                    value={stats.selectedPeriodRevenue}
                                    prefix={<DollarOutlined />}
                                    suffix="₺"
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title={`${comparisonRange[0].format('MMMM YYYY')} Cirosu`}
                                    value={stats.comparisonPeriodRevenue}
                                    prefix={<DollarOutlined />}
                                    suffix="₺"
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Büyüme Oranı"
                                    value={stats.growthRate}
                                    prefix={<RiseOutlined />}
                                    suffix="%"
                                    valueStyle={{ color: stats.growthRate >= 0 ? '#3f8600' : '#cf1322' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Toplam Müşteri"
                                    value={stats.totalCustomers}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12}>
                            <Card>
                                <Statistic
                                    title={`${dateRange[0].format('MMMM YYYY')} Sipariş Sayısı`}
                                    value={stats.selectedPeriodOrders}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card>
                                <Statistic
                                    title={`${comparisonRange[0].format('MMMM YYYY')} Sipariş Sayısı`}
                                    value={stats.comparisonPeriodOrders}
                                    prefix={<ShoppingCartOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Space>
            </div>
        </>
    );
}