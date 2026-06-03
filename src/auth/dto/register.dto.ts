import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MatchField(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'matchField',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `${propertyName} must match ${property}`,
        ...options,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @MatchField('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, { message: 'Phone must be 11 digits' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  governorate: string;

  @IsNotEmpty()
  @IsString()
  city: string;
}