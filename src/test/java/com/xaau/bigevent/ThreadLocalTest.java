package com.xaau.bigevent;

import org.junit.jupiter.api.Test;

public class ThreadLocalTest {

    @Test 
    public void testTheadLocalSetAndGet() throws Exception{
        //提供一个ThreadLocal对象
        ThreadLocal<Object> tl = new ThreadLocal<>();

        //开启两个线程
        Thread t1 = new Thread(()->{
            //设置线程局部变量
            tl.set("天天");
            //获取线程局部变量
            System.out.println(Thread.currentThread().getName()+":"+tl.get());
        },"绿色");

        Thread t2 = new Thread(()->{
            //设置线程局部变量
            tl.set("美美");
            //获取线程局部变量
            System.out.println(Thread.currentThread().getName()+":"+tl.get());
        },"红色");

        t1.start();
        t2.start();

        t1.join();
        t2.join();
    }

}
