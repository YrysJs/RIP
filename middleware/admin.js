import {parseJwt} from '~/utils/parseJwt';
import Cookies from 'js-cookie';

export default defineNuxtRouteMiddleware((to) => {
    const router = useRouter();
    if (Cookies.get('token')) {
        const token = parseJwt(Cookies.get('token'))
        if (token.role !== 'ADMIN') router.push('/');
    } else router.push('/')
});
